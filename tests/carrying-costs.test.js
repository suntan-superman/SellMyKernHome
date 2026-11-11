import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_CARRYING_COST_INPUTS, calculateCarryingCosts, normalizeHoldingMonths } from "../lib/carrying-costs.js";
import { track } from "../lib/analytics.js";

test("default carrying cost example totals 2650 monthly and 15900 over six months", () => {
  const result = calculateCarryingCosts(DEFAULT_CARRYING_COST_INPUTS);
  assert.equal(result.monthlyTotal, 265_000);
  assert.equal(result.holdingTotal, 1_590_000);
  assert.equal(result.months, 6);
});

test("changed expenses and holding period calculate instantly in cents", () => {
  const result = calculateCarryingCosts({ mortgage: "2000", propertyTaxes: "400", insurance: "100", utilities: "250", maintenance: "200", other: "50", months: "12" });
  assert.equal(result.monthlyTotal, 300_000);
  assert.equal(result.holdingTotal, 3_600_000);
});

test("zero expenses remain valid", () => {
  const result = calculateCarryingCosts({ mortgage: "0", propertyTaxes: "0", insurance: "0", utilities: "0", maintenance: "0", other: "0", months: "24" });
  assert.equal(result.monthlyTotal, 0);
  assert.equal(result.holdingTotal, 0);
});

test("invalid and negative expenses normalize without invalid arithmetic", () => {
  const result = calculateCarryingCosts({ mortgage: "invalid", propertyTaxes: "-25", insurance: "", utilities: null, maintenance: undefined, other: "0", months: "invalid" });
  assert.equal(result.monthlyTotal, 0);
  assert.equal(result.holdingTotal, 0);
  assert.equal(result.months, 1);
});

test("decimal expenses use currency-safe cents and holding months clamp to 1 through 24", () => {
  const result = calculateCarryingCosts({ mortgage: "0.10", propertyTaxes: "0.20", insurance: "0.30", utilities: "0.40", maintenance: "0.50", other: "0.60", months: "2" });
  assert.equal(result.monthlyTotal, 210);
  assert.equal(result.holdingTotal, 420);
  assert.equal(normalizeHoldingMonths("0"), 1);
  assert.equal(normalizeHoldingMonths("25"), 24);
  assert.equal(normalizeHoldingMonths("6.9"), 6);
});

test("carrying calculator analytics require consent and discard financial values", () => {
  const calls = [];
  global.window = { localStorage: { getItem: () => "denied" }, gtag: (...args) => calls.push(args) };
  track("carrying_calculator_transfer", { location: "carrying_cost_calculator", destination: "/tools/home-sale-net-proceeds-calculator", mortgage: 1800, holdingTotal: 15900, months: 6 });
  assert.equal(calls.length, 0);
  global.window.localStorage.getItem = () => "granted";
  track("carrying_calculator_transfer", { location: "carrying_cost_calculator", destination: "/tools/home-sale-net-proceeds-calculator", mortgage: 1800, holdingTotal: 15900, months: 6 });
  assert.deepEqual(calls, [["event", "carrying_calculator_transfer", { location: "carrying_cost_calculator", destination: "/tools/home-sale-net-proceeds-calculator" }]]);
  delete global.window;
});
