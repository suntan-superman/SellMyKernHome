import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";

const root = path.resolve(import.meta.dirname, "..");
const migration = fs.readFileSync(path.join(root, "supabase/staging/20261101_adam_demo.sql"), "utf8");
const seed = fs.readFileSync(path.join(root, "supabase/staging/20261101_adam_demo_seed.sql"), "utf8");
const adminId = "20000000-0000-4000-8000-000000000001";
const viewerId = "20000000-0000-4000-8000-000000000002";
const outsiderId = "20000000-0000-4000-8000-000000000003";
const leadId = "20000000-0000-4000-8000-000000000010";

async function baseDatabase({ withGnz = false } = {}) {
  const db = new PGlite();
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
    ${withGnz ? "create table public.gnz_leads (id uuid primary key);" : ""}
    select set_config('smkh.environment', 'staging', false);
  `);
  return db;
}

test("isolated schema refuses a database containing GNZ lead tables", async () => {
  const db = await baseDatabase({ withGnz: true });
  try {
    await assert.rejects(db.exec(migration), /GNZ tables exist/i);
  } finally {
    await db.close();
  }
});

test("isolated schema enforces synthetic data, independent membership, statuses, and audit attribution", async () => {
  const db = await baseDatabase();
  try {
    await db.exec(migration);
    await db.exec(`
      insert into auth.users (id) values ('${adminId}'), ('${viewerId}'), ('${outsiderId}');
      insert into public.smkh_admin_memberships (user_id, display_name, role) values
        ('${adminId}', 'Synthetic Operator', 'operator'),
        ('${viewerId}', 'Synthetic Viewer', 'viewer');
      insert into public.smkh_leads (
        id, reference, submission_token, first_name, last_name, phone, email,
        preferred_contact, message, property_address, property_city, property_zip
      ) values (
        '${leadId}', 'SMKH-DEMO-UNIT-001', '20000000-0000-4000-8000-000000000011',
        'Casey', 'Example', '(661) 555-0101', 'casey@example.test', 'email',
        'Synthetic unit-test record', '1000 Example Avenue', 'Bakersfield', '93301'
      );
    `);

    const objects = await db.query(`
      select
        to_regclass('public.smkh_leads') is not null as smkh_exists,
        to_regclass('public.gnz_leads') is null as gnz_absent,
        (select relrowsecurity from pg_class where oid = 'public.smkh_leads'::regclass) as rls_enabled,
        has_table_privilege('anon', 'public.smkh_leads', 'select') as anon_select,
        has_table_privilege('authenticated', 'public.smkh_leads', 'select') as authenticated_select,
        has_table_privilege('service_role', 'public.smkh_leads', 'select,insert') as service_insert,
        has_table_privilege('service_role', 'public.smkh_leads', 'update') as service_update
    `);
    assert.deepEqual(objects.rows[0], {
      smkh_exists: true,
      gnz_absent: true,
      rls_enabled: true,
      anon_select: false,
      authenticated_select: true,
      service_insert: true,
      service_update: false,
    });

    await db.exec(`select set_config('request.jwt.claim.sub', '${outsiderId}', false); set role authenticated;`);
    const outsiderRead = await db.query("select count(*)::int as count from public.smkh_leads");
    assert.equal(outsiderRead.rows[0].count, 0);
    await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${viewerId}', false); set role authenticated;`);
    const viewerRead = await db.query("select count(*)::int as count from public.smkh_leads");
    assert.equal(viewerRead.rows[0].count, 1);
    await db.exec("reset role");

    const statuses = ["new", "contacted", "qualified", "appointment", "offer_made", "under_contract", "closed", "lost"];
    await db.exec(`select set_config('request.jwt.claim.sub', '${adminId}', false); set role authenticated;`);
    for (const status of statuses) {
      const updated = await db.query(`
        select status, assigned_to, follow_up_at is not null as has_follow_up
        from public.smkh_admin_update_lead(
          '${leadId}', '${status}', 'Synthetic internal note', '${adminId}',
          '2026-11-03T18:00:00Z'::timestamptz, null::timestamptz
        )
      `);
      assert.equal(updated.rows[0].status, status);
      assert.equal(updated.rows[0].assigned_to, adminId);
      assert.equal(updated.rows[0].has_follow_up, true);
    }

    await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${viewerId}', false); set role authenticated;`);
    await assert.rejects(
      db.query(`select * from public.smkh_admin_update_lead('${leadId}', 'closed', '', null, null, null)`),
      /Active SMKH operator membership is required/i,
    );
    await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${outsiderId}', false); set role authenticated;`);
    await assert.rejects(
      db.query(`select * from public.smkh_admin_update_lead('${leadId}', 'closed', '', null, null, null)`),
      /Active SMKH operator membership is required/i,
    );
    await db.exec("reset role; set role service_role");
    await assert.rejects(
      db.query(`update public.smkh_leads set status = 'lost' where id = '${leadId}'`),
      /permission denied/i,
    );
    await db.exec("reset role");

    const audit = await db.query(`
      select actor_kind, actor_id, after_state->>'status' as status,
        (after_state->>'notes_changed')::boolean as notes_changed
      from public.smkh_lead_audit
      where lead_id = '${leadId}'
      order by id desc limit 1
    `);
    assert.deepEqual(audit.rows[0], { actor_kind: "admin", actor_id: adminId, status: "lost", notes_changed: false });

    await assert.rejects(
      db.exec(`insert into public.smkh_leads (
        reference, submission_token, first_name, email, preferred_contact,
        property_address, property_city, property_zip
      ) values (
        'SMKH-REAL-DATA-BLOCKED', '20000000-0000-4000-8000-000000000012',
        'Real', 'person@ordinary-domain.com', 'email', 'Real address', 'Bakersfield', '93301'
      )`),
      /check constraint/i,
    );

    await db.exec(seed);
    const seeded = await db.query("select count(*)::int as count from public.smkh_leads where reference = 'SMKH-DEMO-SYNTHETIC-001'");
    assert.equal(seeded.rows[0].count, 1);
  } finally {
    await db.close();
  }
});
