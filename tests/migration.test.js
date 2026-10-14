import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";

const root = path.resolve(import.meta.dirname, "..");
const migration = fs.readFileSync(
  path.join(root, "supabase/migrations/20261014_sellmykernhome_leads.sql"),
  "utf8",
);

const adminId = "11111111-1111-4111-8111-111111111111";
const outsiderId = "22222222-2222-4222-8222-222222222222";
const existingLeadId = "33333333-3333-4333-8333-333333333333";
const sellerLeadId = "44444444-4444-4444-8444-444444444444";

async function createLegacyDatabase() {
  const db = new PGlite();
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema auth;
    create table auth.users (id uuid primary key);
    create table public.admin_users (
      user_id uuid primary key references auth.users(id),
      display_name text not null
    );
    create table public.gnz_leads (
      id uuid primary key default gen_random_uuid(),
      reference text not null unique,
      submission_token uuid not null unique,
      source text not null default 'contact',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      first_name text not null,
      last_name text not null default '',
      company_name text not null default '',
      phone text not null,
      email text not null,
      service text not null,
      message text not null,
      internal_notes text not null default '',
      status text not null default 'new'
        constraint gnz_leads_status_check
        check (status in ('new', 'contacted', 'qualified', 'closed'))
    );
    alter table public.gnz_leads enable row level security;
    revoke all on public.gnz_leads from public, anon, authenticated;
    -- Reproduce the production ACL drift that this migration must remediate.
    grant all privileges on public.gnz_leads to service_role;

    insert into auth.users (id) values
      ('${adminId}'),
      ('${outsiderId}');
    insert into public.admin_users (user_id, display_name)
      values ('${adminId}', 'Synthetic Admin');
    insert into public.gnz_leads (
      id, reference, submission_token, first_name, last_name, phone, email,
      service, message, internal_notes, status
    ) values (
      '${existingLeadId}', 'GNZ-EXISTING',
      '55555555-5555-4555-8555-555555555555',
      'Existing', 'Lead', '6615550100', 'existing@example.test',
      'marketing', 'Existing synthetic record', 'Preserve this note', 'qualified'
    );
  `);
  return db;
}

test("hardened migration preserves GNZ data and enforces trusted actor attribution", async () => {
  const db = await createLegacyDatabase();
  try {
    await db.exec(migration);

    const preserved = await db.query(`
      select reference, status, internal_notes, lead_type, source_site
      from public.gnz_leads
      where id = '${existingLeadId}'
    `);
    assert.deepEqual(preserved.rows, [{
      reference: "GNZ-EXISTING",
      status: "qualified",
      internal_notes: "Preserve this note",
      lead_type: "investor",
      source_site: "gnzmarketingllc.com",
    }]);

    const privileges = await db.query(`
      select
        has_table_privilege('anon', 'public.gnz_leads', 'select') as anon_select,
        has_table_privilege('authenticated', 'public.gnz_leads', 'select') as authenticated_select,
        has_table_privilege('service_role', 'public.gnz_leads', 'select,insert,update') as service_access,
        has_table_privilege('service_role', 'public.gnz_leads', 'delete') as service_delete,
        has_function_privilege(
          'anon',
          'public.smkh_admin_update_lead(uuid,text,text,uuid,uuid)',
          'execute'
        ) as anon_rpc
    `);
    assert.deepEqual(privileges.rows[0], {
      anon_select: false,
      authenticated_select: false,
      service_access: true,
      service_delete: false,
      anon_rpc: false,
    });

    await db.exec("set role anon");
    await assert.rejects(
      db.query("select id from public.gnz_leads limit 1"),
      /permission denied/i,
    );
    await db.exec("reset role");

    await db.exec("set role authenticated");
    await assert.rejects(
      db.query("select id from public.gnz_leads limit 1"),
      /permission denied/i,
    );
    await db.exec("reset role");

    await db.exec("set role service_role");
    const serviceRead = await db.query("select count(*)::int as count from public.gnz_leads");
    await assert.rejects(
      db.query(`delete from public.gnz_leads where id = '${existingLeadId}'`),
      /permission denied/i,
    );
    await db.exec("reset role");
    assert.equal(serviceRead.rows[0].count, 1);

    await db.exec(`
      insert into public.gnz_leads (
        id, reference, submission_token, source, lead_type, source_site,
        first_name, last_name, phone, email, service, message, status
      ) values (
        '${sellerLeadId}', 'SMKH-SYNTHETIC',
        '66666666-6666-4666-8666-666666666666',
        'seller_web', 'seller', 'sellmykernhome.com',
        'Synthetic', 'Seller', '6615550111', 'seller@example.test',
        'seller-property', 'Synthetic seller test', 'new'
      )
    `);

    const systemAudit = await db.query(`
      select actor_kind, actor_id
      from public.smkh_lead_audit
      where lead_id = '${sellerLeadId}' and action = 'INSERT'
    `);
    assert.deepEqual(systemAudit.rows, [{ actor_kind: "system", actor_id: null }]);

    const updated = await db.query(`
      select id, status, assigned_to
      from public.smkh_admin_update_lead(
        '${sellerLeadId}',
        'in_discussion',
        'Verified synthetic update',
        '${adminId}',
        '${adminId}'
      )
    `);
    assert.equal(updated.rows[0].status, "in_discussion");
    assert.equal(updated.rows[0].assigned_to, adminId);

    const adminAudit = await db.query(`
      select actor_kind, actor_id, after_state->>'status' as status
      from public.smkh_lead_audit
      where lead_id = '${sellerLeadId}' and action = 'UPDATE'
      order by id desc
      limit 1
    `);
    assert.deepEqual(adminAudit.rows[0], {
      actor_kind: "admin",
      actor_id: adminId,
      status: "in_discussion",
    });

    await assert.rejects(
      db.query(`
        select * from public.smkh_admin_update_lead(
          '${sellerLeadId}', 'closed', '', null, '${outsiderId}'
        )
      `),
      /Verified GNZ Admin membership is required/i,
    );

    await db.exec(`
      update public.gnz_leads
      set status = 'contacted'
      where id = '${sellerLeadId}'
    `);
    const latestSystemAudit = await db.query(`
      select actor_kind, actor_id
      from public.smkh_lead_audit
      where lead_id = '${sellerLeadId}' and action = 'UPDATE'
      order by id desc
      limit 1
    `);
    assert.deepEqual(latestSystemAudit.rows[0], {
      actor_kind: "system",
      actor_id: null,
    });

    const firstRate = await db.query(
      "select * from public.smkh_check_rate_limit('synthetic-hash', 1, 60)",
    );
    const secondRate = await db.query(
      "select * from public.smkh_check_rate_limit('synthetic-hash', 1, 60)",
    );
    assert.equal(firstRate.rows[0].allowed, true);
    assert.equal(secondRate.rows[0].allowed, false);

    const statuses = await db.query(`
      select status
      from public.gnz_leads
      where id in ('${existingLeadId}', '${sellerLeadId}')
      order by id
    `);
    assert.deepEqual(
      new Set(statuses.rows.map((row) => row.status)),
      new Set(["qualified", "contacted"]),
    );
  } finally {
    await db.close();
  }
});
