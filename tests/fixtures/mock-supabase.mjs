import http from "node:http";
import { randomUUID } from "node:crypto";

const port = Number(process.env.MOCK_SUPABASE_PORT || 54321);
const state = { leads: [], notifications: [], rateCalls: 0, events: [], buckets: new Map() };

function reset() {
  state.leads = [];
  state.notifications = [];
  state.rateCalls = 0;
  state.events = [];
  state.buckets.clear();
}

function json(response, status, value) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(value));
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
  if (request.method === "POST" && url.pathname === "/rest/v1/gnz_leads") {
    const record = await body(request);
    const lead = { ...record, id: randomUUID() };
    state.leads.push(lead);
    state.events.push("lead_insert");
    return json(response, 201, { id: lead.id, reference: lead.reference, submission_token: lead.submission_token });
  }
  if (request.method === "POST" && url.pathname === "/rest/v1/smkh_notification_logs") {
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
