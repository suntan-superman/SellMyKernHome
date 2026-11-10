export const DEFAULT_NET_PROCEEDS_INPUTS = Object.freeze({
  repairSalePrice: "320000",
  repairBudget: "25000",
  repairSellingExpenseRate: "6",
  repairCarryingCosts: "3000",
  asIsSalePrice: "275000",
  asIsSellingExpenseRate: "2",
  asIsCarryingCosts: "1000",
  mortgagePayoff: "0",
});

const MAX_CURRENCY_DOLLARS = 100_000_000;
const MAX_PERCENT = 100;

function parseScaledNonNegative(value, decimalPlaces, maximum) {
  const source = String(value ?? "").trim().replaceAll(",", "");
  if (!/^\d+(?:\.\d*)?$/.test(source)) return 0;
  const [wholeText, fractionText = ""] = source.split(".");
  const scale = 10 ** decimalPlaces;
  const whole = Number.parseInt(wholeText, 10);
  if (!Number.isSafeInteger(whole) || whole > maximum) return maximum * scale;
  const fraction = Number.parseInt(fractionText.padEnd(decimalPlaces, "0").slice(0, decimalPlaces) || "0", 10);
  return Math.min((whole * scale) + fraction, maximum * scale);
}

export function dollarsToCents(value) {
  return parseScaledNonNegative(value, 2, MAX_CURRENCY_DOLLARS);
}

export function percentToBasisPoints(value) {
  return parseScaledNonNegative(value, 2, MAX_PERCENT);
}

export function percentageOfCents(amountCents, rateBasisPoints) {
  return Math.round((amountCents * rateBasisPoints) / 10_000);
}

export function calculateNetProceeds(input = {}) {
  const repairSalePrice = dollarsToCents(input.repairSalePrice);
  const repairBudget = dollarsToCents(input.repairBudget);
  const repairSellingExpenseRate = percentToBasisPoints(input.repairSellingExpenseRate);
  const repairCarryingCosts = dollarsToCents(input.repairCarryingCosts);
  const asIsSalePrice = dollarsToCents(input.asIsSalePrice);
  const asIsSellingExpenseRate = percentToBasisPoints(input.asIsSellingExpenseRate);
  const asIsCarryingCosts = dollarsToCents(input.asIsCarryingCosts);
  const mortgagePayoff = dollarsToCents(input.mortgagePayoff);

  const repairSellingExpenses = percentageOfCents(repairSalePrice, repairSellingExpenseRate);
  const asIsSellingExpenses = percentageOfCents(asIsSalePrice, asIsSellingExpenseRate);
  const repairAndListNet = repairSalePrice - repairBudget - repairSellingExpenses - repairCarryingCosts - mortgagePayoff;
  const asIsNet = asIsSalePrice - asIsSellingExpenses - asIsCarryingCosts - mortgagePayoff;

  return {
    repairAndListNet,
    asIsNet,
    difference: repairAndListNet - asIsNet,
    mortgagePayoff,
    repairAndList: {
      salePrice: repairSalePrice,
      repairBudget,
      sellingExpenses: repairSellingExpenses,
      carryingCosts: repairCarryingCosts,
      mortgagePayoff,
    },
    asIs: {
      salePrice: asIsSalePrice,
      sellingExpenses: asIsSellingExpenses,
      carryingCosts: asIsCarryingCosts,
      mortgagePayoff,
    },
  };
}

export function formatUsd(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
