import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";

const root = path.resolve(import.meta.dirname, "..");
const migration = fs.readFileSync(
  path.join(root, "supabase/migrations/20261101_smkh_independent_workflow.sql"),
  "utf8",
);

const adminId = "11111111-1111-4111-8111-111111111111";
const outsiderId = "22222222-2222-4222-8222-222222222222";
const sellerId = "33333333-3333-4333-8333-333333333333";
const archivedSellerId = "44444444-4444-4444-8444-444444444444";
const investorId = "55555555-5555-4555-8555-555555555555";

async function createProductionShape() {
  const db = new PGlite();
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema auth;
    grant usage on schema auth to anon, authenticated, service_role;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable
      as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant execute on function auth.uid() to anon, authenticated, service_role;

    create table public.admin_users (
      user_id uuid primary key references auth.users(id),
      display_name text not null,
      created_at timestamptz not null default now()
    );
    create table public.gnz_leads (
      id uuid primary key default gen_random_uuid(), reference text not null unique,
      submission_token uuid not null unique, source text not null default 'contact',
      created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
      first_name text not null, last_name text not null default '', company_name text not null default '',
      phone text not null default '', email text not null default '', service text not null,
      message text not null default '', internal_notes text not null default '', status text not null default 'new',
      lead_type text not null default 'investor', source_site text not null default 'gnzmarketingllc.com',
      preferred_contact text not null default 'email', property_address text not null default '',
      property_city text not null default '', property_zip text not null default '', property_type text,
      property_condition text, occupancy text, desired_timing text,
      attribution jsonb not null default '{}'::jsonb, consent jsonb not null default '{}'::jsonb,
      assigned_to uuid, archived_at timestamptz, archived_by uuid
    );
    create table public.smkh_lead_audit (
      id bigint generated always as identity primary key, lead_id uuid not null,
      action text not null, actor_id uuid, actor_kind text not null,
      before_state jsonb, after_state jsonb, created_at timestamptz not null default now()
    );
    create table public.smkh_notification_logs (
      id uuid primary key default gen_random_uuid(), lead_id uuid not null,
      channel text not null, status text not null, provider_id text, error_code text,
      attempted_at timestamptz not null default now()
    );
    create table public.smkh_rate_limits (
      identifier_hash text primary key, window_started_at timestamptz not null default now(),
      request_count integer not null default 0
    );

    insert into auth.users (id) values ('${adminId}'), ('${outsiderId}');
    insert into public.admin_users (user_id, display_name) values ('${adminId}', 'Synthetic Owner');
    insert into public.gnz_leads (
      id, reference, submission_token, source, first_name, last_name, phone, email, service, message,
      internal_notes, status, lead_type, source_site, preferred_contact, property_address, property_city,
      property_zip, attribution, consent, archived_at
    ) values
      ('${sellerId}', 'SMKH-NEW', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'seller_web',
       'Synthetic', 'Seller', '6615550101', 'seller@example.test', 'seller-property', 'Synthetic only',
       'Preserve seller note', 'new', 'seller', 'sellmykernhome.com', 'email', '100 Test Way',
       'Bakersfield', '93301', '{"utm_source":"test"}', '{"privacy":true}', null),
      ('${archivedSellerId}', 'SMKH-OLD', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'seller_web',
       'Archived', 'Seller', '6615550102', 'archived@example.test', 'seller-property', 'Synthetic only',
       'Preserve archived note', 'in_discussion', 'seller', 'sellmykernhome.com', 'phone', '200 Test Way',
       'Bakersfield', '93309', '{}', '{"privacy":true}', now()),
      ('${investorId}', 'GNZ-INVESTOR', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'contact',
       'Synthetic', 'Investor', '6615550103', 'investor@example.test', 'investor', 'Synthetic only',
       'Do not copy or alter', 'new', 'investor', 'gnzmarketingllc.com', 'email', '', '', '', '{}', '{}', null);
    insert into public.smkh_lead_audit (lead_id, action, actor_kind, after_state)
      values ('${sellerId}', 'INSERT', 'system', '{"status":"new"}');
    insert into public.smkh_notification_logs (lead_id, channel, status)
      values ('${sellerId}', 'email', 'sent');
  `);
  return db;
}

async function asRole(db, role, userId, statement) {
  await db.exec(`set request.jwt.claim.sub = '${userId || ""}'; set role ${role};`);
  try {
    return await db.query(statement);
  } finally {
    await db.exec("reset role; reset request.jwt.claim.sub;");
  }
}

test("independent SMKH migration copies seller history without changing GNZ data", async () => {
  const db = await createProductionShape();
  try {
    const before = await db.query("select id, status, internal_notes, lead_type, source_site from public.gnz_leads order by id");
    await db.exec(migration);
    const after = await db.query("select id, status, internal_notes, lead_type, source_site from public.gnz_leads order by id");
    assert.deepEqual(after.rows, before.rows);

    const leads = await db.query("select id, status, legacy_status, legacy_gnz_lead_id from public.smkh_leads order by id");
    assert.equal(leads.rows.length, 2);
    assert.equal(leads.rows.find((row) => row.id === sellerId).status, "new");
    assert.deepEqual(
      leads.rows.find((row) => row.id === archivedSellerId),
      { id: archivedSellerId, status: "contacted", legacy_status: "in_discussion", legacy_gnz_lead_id: archivedSellerId },
    );

    const copied = await db.query(`
      select
        (select count(*)::int from public.smkh_admin_memberships) as memberships,
        (select count(*)::int from public.smkh_lead_events where legacy_audit_id is not null) as audit_events,
        (select count(*)::int from public.smkh_notifications where legacy_notification_id is not null) as notifications
    `);
    assert.deepEqual(copied.rows[0], { memberships: 1, audit_events: 1, notifications: 1 });

    const privileges = await db.query(`
      select
        has_table_privilege('anon', 'public.smkh_leads', 'select') as anon_select,
        has_table_privilege('authenticated', 'public.smkh_leads', 'select') as authenticated_select,
        has_table_privilege('service_role', 'public.smkh_leads', 'select,insert') as service_insert,
        has_table_privilege('service_role', 'public.smkh_leads', 'update') as service_update,
        has_table_privilege('service_role', 'public.smkh_leads', 'delete') as service_delete,
        has_function_privilege('anon', 'public.smkh_update_lead(uuid,text,text,timestamptz,timestamptz)', 'execute') as anon_rpc,
        has_function_privilege('authenticated', 'public.smkh_update_lead(uuid,text,text,timestamptz,timestamptz)', 'execute') as authenticated_rpc
    `);
    assert.deepEqual(privileges.rows[0], {
      anon_select: false,
      authenticated_select: true,
      service_insert: true,
      service_update: false,
      service_delete: false,
      anon_rpc: false,
      authenticated_rpc: true,
    });

    await assert.rejects(asRole(db, "anon", outsiderId, "select id from public.smkh_leads"), /permission denied/i);
    const outsiderRead = await asRole(db, "authenticated", outsiderId, "select id from public.smkh_leads");
    assert.equal(outsiderRead.rows.length, 0);
    const adminRead = await asRole(db, "authenticated", adminId, "select id from public.smkh_leads");
    assert.equal(adminRead.rows.length, 2);

    await db.exec("set role service_role");
    await assert.rejects(
      db.query(`update public.smkh_leads set status = 'lost' where id = '${sellerId}'`),
      /permission denied/i,
    );
    await db.exec("reset role");

    const updated = await asRole(db, "authenticated", adminId, `
      select id, status from public.smkh_update_lead(
        '${sellerId}', 'qualified', 'Verified operator note', null, now()
      )
    `);
    assert.deepEqual(updated.rows, [{ id: sellerId, status: "qualified" }]);
    const audit = await db.query(`
      select actor_id, actor_kind, after_state->>'status' as status
      from public.smkh_lead_events where lead_id = '${sellerId}' and action = 'UPDATE'
      order by id desc limit 1
    `);
    assert.deepEqual(audit.rows[0], { actor_id: adminId, actor_kind: "admin", status: "qualified" });

    await assert.rejects(
      asRole(db, "authenticated", outsiderId, `select * from public.smkh_update_lead('${sellerId}', 'lost', '', null, null)`),
      /Active SMKH operator membership is required/i,
    );
    const gnzFinal = await db.query("select id, status, internal_notes, lead_type, source_site from public.gnz_leads order by id");
    assert.deepEqual(gnzFinal.rows, before.rows);
  } finally {
    await db.close();
  }
});
