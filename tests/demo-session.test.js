import test from "node:test";
import assert from "node:assert/strict";
import { signDemoSession, verifyDemoSession } from "../lib/demo-session-core.js";

const secret = "isolated-test-session-secret-with-at-least-32-characters";

test("private demo sessions are signed, scoped, expiring, and secret-bound", async () => {
  const issuedAt = Date.UTC(2026, 10, 1, 16, 0, 0);
  const token = await signDemoSession(secret, issuedAt);
  assert.equal(await verifyDemoSession(token, secret, issuedAt + 60_000), true);
  assert.equal(await verifyDemoSession(token, "different-isolated-secret-with-at-least-32-characters", issuedAt + 60_000), false);
  assert.equal(await verifyDemoSession(token, secret, issuedAt + (4 * 60 * 60 + 1) * 1000), false);
  assert.equal(await verifyDemoSession("not-a-token", secret, issuedAt), false);
});
