import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";

const root = path.resolve(import.meta.dirname, "..");
const migration = fs.readFileSync(path.join(root, "supabase/migrations/20261101_smkh_property_intelligence.sql"), "utf8");
const preflight = fs.readFileSync(path.join(root, "supabase/verification/20261101_smkh_pi_preflight.sql"), "utf8");
const postflight = fs.readFileSync(path.join(root, "supabase/verification/20261101_smkh_pi_postflight.sql"), "utf8");
const ownerId = "11111111-1111-4111-8111-111111111111";
const outsiderId = "22222222-2222-4222-8222-222222222222";

async function createPiShape() {
  const db = new PGlite();
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema auth;
    grant usage on schema auth to anon, authenticated, service_role;
    create table auth.users (
      id uuid primary key, email text not null unique,
      email_confirmed_at timestamptz, banned_until timestamptz, deleted_at timestamptz
    );
    create function auth.uid() returns uuid language sql stable
      as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant execute on function auth.uid() to anon, authenticated, service_role;
    create table public.pi_properties (
      id uuid primary key default gen_random_uuid(), address text not null,
      created_at timestamptz not null default now()
    );
    create table public.pi_reports (
      id uuid primary key default gen_random_uuid(), property_id uuid references public.pi_properties(id),
      payload jsonb not null default '{}'::jsonb
    );
    insert into auth.users (id,email,email_confirmed_at) values
      ('${ownerId}','owner@example.test',now()),
      ('${outsiderId}','outsider@example.test',now());
    insert into public.pi_properties (address) values ('Synthetic PI property');
  `);
  return db;
}

async function setOwnerContext(db) {
  await db.exec(`
    select set_config('smkh.bootstrap_owner_user_id','${ownerId}',false);
    select set_config('smkh.bootstrap_owner_email','owner@example.test',false);
    select set_config('smkh.bootstrap_owner_display_name','Synthetic Owner',false);
  `);
}

async function asRole(db, role, userId, statement) {
  await db.exec(`set request.jwt.claim.sub='${userId || ""}'; set role ${role};`);
  try { return await db.query(statement); }
  finally { await db.exec("reset role; reset request.jwt.claim.sub;"); }
}

test("PI migration is additive, empty, and independently authorized", async () => {
  const db = await createPiShape();
  try {
    const before = await db.query("select * from public.pi_properties order by id");
    await setOwnerContext(db);
    await db.exec(preflight);
    await db.exec(migration);
    await db.exec(postflight);

    const after = await db.query("select * from public.pi_properties order by id");
    assert.deepEqual(after.rows, before.rows);
    const counts = await db.query(`select
      (select count(*)::int from public.smkh_admin_memberships) memberships,
      (select count(*)::int from public.smkh_leads) leads,
      (select count(*)::int from public.smkh_lead_events) events,
      (select count(*)::int from public.smkh_notifications) notifications,
      (select count(*)::int from public.smkh_rate_limits) rate_limits`);
    assert.deepEqual(counts.rows[0], { memberships: 1, leads: 0, events: 0, notifications: 0, rate_limits: 0 });
    const membership = await db.query("select user_id,display_name,role,active from public.smkh_admin_memberships");
    assert.deepEqual(membership.rows, [{ user_id: ownerId, display_name: "Synthetic Owner", role: "owner", active: true }]);

    const privileges = await db.query(`select
      has_table_privilege('anon','public.smkh_leads','select') anon_select,
      has_table_privilege('service_role','public.smkh_leads','select,insert') service_insert,
      has_table_privilege('service_role','public.smkh_leads','update') service_update,
      has_table_privilege('service_role','public.smkh_leads','delete') service_delete,
      has_table_privilege('service_role','public.smkh_rate_limits','select,insert,update,delete') service_rate_table,
      has_function_privilege('service_role','public.smkh_check_rate_limit(text,integer,integer)','execute') service_rate_rpc,
      has_function_privilege('anon','public.smkh_check_rate_limit(text,integer,integer)','execute') anon_rate_rpc,
      has_function_privilege('authenticated','public.smkh_update_lead(uuid,text,text,timestamptz,timestamptz)','execute') admin_rpc`);
    assert.deepEqual(privileges.rows[0], {
      anon_select: false, service_insert: true, service_update: false, service_delete: false,
      service_rate_table: false, service_rate_rpc: true, anon_rate_rpc: false, admin_rpc: true,
    });
    await assert.rejects(asRole(db,"anon",outsiderId,"select id from public.smkh_leads"),/permission denied/i);
    assert.equal((await asRole(db,"authenticated",outsiderId,"select id from public.smkh_leads")).rows.length,0);
    assert.equal((await asRole(db,"authenticated",ownerId,"select id from public.smkh_leads")).rows.length,0);
    const rate = await asRole(db,"service_role","", "select * from public.smkh_check_rate_limit('synthetic',2,60)");
    assert.deepEqual(rate.rows,[{ allowed:true,retry_after:60 }]);
  } finally { await db.close(); }
});

test("PI migration fails closed for an unverified owner or existing SMKH object", async () => {
  const db = await createPiShape();
  try {
    await db.exec(`
      select set_config('smkh.bootstrap_owner_user_id','${ownerId}',false);
      select set_config('smkh.bootstrap_owner_email','wrong@example.test',false);
      select set_config('smkh.bootstrap_owner_display_name','Synthetic Owner',false);
    `);
    await assert.rejects(db.exec(migration),/active, confirmed PI Auth user/i);
    await db.exec("rollback");
    await db.exec("create table public.smkh_leads(id uuid primary key)");
    await setOwnerContext(db);
    await assert.rejects(db.exec(migration),/Target object collision/i);
    await db.exec("rollback");
    assert.equal((await db.query("select count(*)::int count from public.pi_properties")).rows[0].count,1);
  } finally { await db.close(); }
});
