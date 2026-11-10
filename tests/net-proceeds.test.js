import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_NET_PROCEEDS_INPUTS,
  calculateNetProceeds,
  dollarsToCents,
  percentToBasisPoints,
} from "../lib/net-proceeds.js";
import { track } from "../lib/analytics.js";

test("default example matches the published comparison", () => {
  const result = calculateNetProceeds(DEFAULT_NET_PROCEEDS_INPUTS);
  assert.equal(result.repairAndListNet, 27_280_000);
  assert.equal(result.asIsNet, 26_850_000);
  assert.equal(result.difference, 430_000);
  assert.equal(result.repairAndList.sellingExpenses, 1_920_000);
  assert.equal(result.asIs.sellingExpenses, 550_000);
});

test("changed inputs calculate each scenario and the difference", () => {
  const result = calculateNetProceeds({
    repairSalePrice: "400000", repairBudget: "50000", repairSellingExpenseRate: "5", repairCarryingCosts: "5000",
    asIsSalePrice: "300000", asIsSellingExpenseRate: "1", asIsCarryingCosts: "0", mortgagePayoff: "100000",
  });
  assert.equal(result.repairAndListNet, 22_500_000);
  assert.equal(result.asIsNet, 19_700_000);
  assert.equal(result.difference, 2_800_000);
});

test("zero repair costs are supported", () => {
  const result = calculateNetProceeds({ ...DEFAULT_NET_PROCEEDS_INPUTS, repairBudget: "0" });
  assert.equal(result.repairAndListNet, 29_780_000);
});

test("zero selling expense rates are supported", () => {
  const result = calculateNetProceeds({ ...DEFAULT_NET_PROCEEDS_INPUTS, repairSellingExpenseRate: "0", asIsSellingExpenseRate: "0" });
  assert.equal(result.repairAndListNet, 29_200_000);
  assert.equal(result.asIsNet, 27_400_000);
  assert.equal(result.difference, 1_800_000);
});

test("an equal mortgage payoff lowers both proceeds without changing the difference", () => {
  const before = calculateNetProceeds(DEFAULT_NET_PROCEEDS_INPUTS);
  const after = calculateNetProceeds({ ...DEFAULT_NET_PROCEEDS_INPUTS, mortgagePayoff: "100000" });
  assert.equal(after.repairAndListNet, before.repairAndListNet - 10_000_000);
  assert.equal(after.asIsNet, before.asIsNet - 10_000_000);
  assert.equal(after.difference, before.difference);
});

test("negative net proceeds remain visible", () => {
  const result = calculateNetProceeds({
    repairSalePrice: "100000", repairBudget: "150000", repairSellingExpenseRate: "0", repairCarryingCosts: "10000",
    asIsSalePrice: "50000", asIsSellingExpenseRate: "0", asIsCarryingCosts: "10000", mortgagePayoff: "20000",
  });
  assert.equal(result.repairAndListNet, -8_000_000);
  assert.equal(result.asIsNet, 2_000_000);
  assert.equal(result.difference, -10_000_000);
});

test("negative and invalid inputs normalize safely without invalid arithmetic", () => {
  assert.equal(dollarsToCents("-1"), 0);
  assert.equal(dollarsToCents("not-a-number"), 0);
  assert.equal(percentToBasisPoints("-2"), 0);
  const result = calculateNetProceeds({ repairSalePrice: "invalid", repairBudget: "-500" });
  assert.equal(result.repairAndListNet, 0);
  assert.equal(result.asIsNet, 0);
  assert.equal(result.difference, 0);
});

test("calculator analytics require consent and discard financial values", () => {
  const calls = [];
  global.window = { localStorage: { getItem: () => "denied" }, gtag: (...args) => calls.push(args) };
  track("calculator_interaction", { location: "net_proceeds_calculator", salePrice: 320000, mortgagePayoff: 100000 });
  assert.equal(calls.length, 0);

  global.window.localStorage.getItem = () => "granted";
  track("calculator_interaction", { location: "net_proceeds_calculator", salePrice: 320000, mortgagePayoff: 100000 });
  assert.deepEqual(calls, [["event", "calculator_interaction", { location: "net_proceeds_calculator" }]]);
  delete global.window;
});
