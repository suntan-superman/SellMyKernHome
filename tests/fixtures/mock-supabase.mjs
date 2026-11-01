import http from "node:http";
import { randomUUID } from "node:crypto";

const port = Number(process.env.MOCK_SUPABASE_PORT || 54321);
const state = { leads: [], notifications: [], rateCalls: 0, events: [], buckets: new Map() };
const adminUser = { id: "11111111-1111-4111-8111-111111111111", email: "admin@example.test" };
const adminLead = {
  id: "33333333-3333-4333-8333-333333333333", reference: "SMKH-LOCAL-DEMO", source: "seller_web",
  source_site: "sellmykernhome.com", created_at: "2026-11-01T16:00:00.000Z", updated_at: "2026-11-01T16:00:00.000Z",
  first_name: "Synthetic", last_name: "Seller", phone: "(661) 555-0100", email: "seller@example.test",
  preferred_contact: "email", message: "Synthetic local admin test only.", property_address: "100 Test Way",
  property_city: "Bakersfield", property_zip: "93301", property_type: "Single-family home",
  property_condition: "Needs some repairs", occupancy: "Owner occupied", desired_timing: "Within 30 days",
  attribution: { utm_source: "local-e2e" }, consent: { privacy_acknowledged: true }, status: "new",
  internal_notes: "", follow_up_at: null, last_contacted_at: null, archived_at: null, legacy_status: null,
};
const adminEvents = [{ id: 1, lead_id: adminLead.id, action: "INSERT", actor_id: null, actor_kind: "system", before_state: null, after_state: { status: "new" }, created_at: adminLead.created_at }];

function reset() {
  state.leads = [];
  state.notifications = [];
  state.rateCalls = 0;
  state.events = [];
  state.buckets.clear();
  Object.assign(adminLead, { status: "new", internal_notes: "", follow_up_at: null, last_contacted_at: null, updated_at: "2026-11-01T16:00:00.000Z" });
  adminEvents.splice(0, adminEvents.length, { id: 1, lead_id: adminLead.id, action: "INSERT", actor_id: null, actor_kind: "system", before_state: null, after_state: { status: "new" }, created_at: adminLead.created_at });
}

function json(response, status, value) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(value));
}

function postgrest(response, request, value) {
  const objectResponse = String(request.headers.accept || "").includes("application/vnd.pgrst.object+json");
  return json(response, 200, objectResponse ? (Array.isArray(value) ? value[0] || null : value) : value);
}

async function body(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://127.0.0.1:${port}`);
  if (request.method === "GET" && url.pathname === "/state") {
    return json(response, 200, {
      leads: state.leads,
      notifications: state.notifications,
      rateCalls: state.rateCalls,
      events: state.events,
    });
  }
  if (request.method === "POST" && url.pathname === "/reset") {
    reset();
    return json(response, 200, { ok: true });
  }
  if (request.method === "POST" && url.pathname === "/rest/v1/rpc/smkh_check_rate_limit") {
    const input = await body(request);
    const count = (state.buckets.get(input.p_identifier_hash) || 0) + 1;
    state.buckets.set(input.p_identifier_hash, count);
    state.rateCalls += 1;
    state.events.push("rate_limit");
    return json(response, 200, [{ allowed: count <= Number(input.p_request_limit), retry_after: count > Number(input.p_request_limit) ? 60 : 0 }]);
  }
  if (request.method === "POST" && url.pathname === "/auth/v1/token") {
    const input = await body(request);
    if (input.email !== adminUser.email || input.password !== "synthetic-admin-password") return json(response, 400, { message: "Invalid login credentials" });
    return json(response, 200, { access_token: "mock-admin-access-token", token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: "mock-refresh-token", user: adminUser });
  }
  if (request.method === "GET" && url.pathname === "/auth/v1/user") {
    return request.headers.authorization === "Bearer mock-admin-access-token" ? json(response, 200, adminUser) : json(response, 401, { message: "Unauthorized" });
  }
  if (request.method === "GET" && url.pathname === "/rest/v1/smkh_admin_memberships") {
    return postgrest(response, request, [{ user_id: adminUser.id, display_name: "Synthetic Owner", role: "owner", active: true }]);
  }
  if (request.method === "GET" && url.pathname === "/rest/v1/smkh_leads") {
    const records = [adminLead, ...state.leads];
    const idFilter = url.searchParams.get("id");
    return postgrest(response, request, idFilter?.startsWith("eq.") ? records.filter((lead) => lead.id === idFilter.slice(3)) : records);
  }
  if (request.method === "GET" && url.pathname === "/rest/v1/smkh_lead_events") {
    const leadId = url.searchParams.get("lead_id")?.replace(/^eq\./, "");
    return postgrest(response, request, adminEvents.filter((event) => !leadId || event.lead_id === leadId));
  }
  if (request.method === "GET" && url.pathname === "/rest/v1/smkh_notifications") {
    const leadId = url.searchParams.get("lead_id")?.replace(/^eq\./, "");
    return postgrest(response, request, state.notifications.filter((item) => !leadId || item.lead_id === leadId));
  }
  if (request.method === "POST" && url.pathname === "/rest/v1/rpc/smkh_update_lead") {
    const input = await body(request);
    if (input.p_lead_id !== adminLead.id) return json(response, 200, []);
    adminLead.status = input.p_status;
    adminLead.internal_notes = input.p_internal_notes;
    adminLead.follow_up_at = input.p_follow_up_at;
    adminLead.last_contacted_at = input.p_last_contacted_at;
    adminLead.updated_at = new Date().toISOString();
    adminEvents.unshift({ id: adminEvents.length + 1, lead_id: adminLead.id, action: "UPDATE", actor_id: adminUser.id, actor_kind: "admin", before_state: { status: "new" }, after_state: { status: adminLead.status, notes_changed: true }, created_at: adminLead.updated_at });
    return json(response, 200, [adminLead]);
  }
  if (request.method === "POST" && url.pathname === "/rest/v1/smkh_leads") {
    const record = await body(request);
    const lead = { ...record, id: randomUUID() };
    state.leads.push(lead);
    state.events.push("lead_insert");
    return json(response, 201, { id: lead.id, reference: lead.reference, submission_token: lead.submission_token });
  }
  if (request.method === "POST" && url.pathname === "/rest/v1/smkh_notifications") {
    const record = await body(request);
    state.notifications.push(record);
    state.events.push("notification_log");
    return json(response, 201, []);
  }
  return json(response, 404, { message: "Unhandled isolated test request", path: url.pathname });
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`isolated-supabase-ready:${port}\n`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
