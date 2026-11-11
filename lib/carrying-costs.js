import { dollarsToCents } from "./net-proceeds.js";

export const CARRYING_COST_TRANSFER_KEY = "smkh_carrying_cost_transfer";

export const DEFAULT_CARRYING_COST_INPUTS = Object.freeze({
  mortgage: "1800",
  propertyTaxes: "350",
  insurance: "150",
  utilities: "200",
  maintenance: "150",
  other: "0",
  months: "6",
});

export const carryingCostFields = [
  ["mortgage", "Monthly mortgage payment"],
  ["propertyTaxes", "Monthly property taxes"],
  ["insurance", "Monthly homeowners insurance"],
  ["utilities", "Monthly utilities"],
  ["maintenance", "Monthly maintenance"],
  ["other", "Other monthly costs"],
];

export function normalizeHoldingMonths(value) {
  const parsed = Number.parseInt(String(value ?? "").trim(), 10);
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(24, Math.max(1, parsed));
}

export function calculateCarryingCosts(input = {}) {
  const items = Object.fromEntries(carryingCostFields.map(([field]) => [field, dollarsToCents(input[field])]));
  const months = normalizeHoldingMonths(input.months);
  const monthlyTotal = Object.values(items).reduce((total, value) => total + value, 0);
  return { items, months, monthlyTotal, holdingTotal: monthlyTotal * months };
}
