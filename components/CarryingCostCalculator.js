"use client";

import { useRouter } from "next/navigation";
import { Printer, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CARRYING_COST_TRANSFER_KEY, DEFAULT_CARRYING_COST_INPUTS, calculateCarryingCosts, carryingCostFields, normalizeHoldingMonths } from "@/lib/carrying-costs";
import { formatUsd } from "@/lib/net-proceeds";
import { track } from "@/lib/analytics";

const currencyMaximum = 100_000_000;

function normalizeCurrencyEntry(value) {
  if (value === "") return "";
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return "0";
  return String(Math.min(number, currencyMaximum));
}

export default function CarryingCostCalculator() {
  const router = useRouter();
  const [values, setValues] = useState(DEFAULT_CARRYING_COST_INPUTS);
  const [transferScenario, setTransferScenario] = useState("");
  const viewTracked = useRef(false);
  const interactionTracked = useRef(false);
  const result = useMemo(() => calculateCarryingCosts(values), [values]);
  const largestExpense = Math.max(...Object.values(result.items), 1);

  useEffect(() => {
    if (viewTracked.current) return;
    viewTracked.current = true;
    track("carrying_calculator_view", { location: "carrying_cost_calculator" });
  }, []);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    if (!interactionTracked.current) {
      interactionTracked.current = true;
      track("carrying_calculator_interaction", { location: "carrying_cost_calculator" });
    }
  }

  function resetExample() {
    setValues({ ...DEFAULT_CARRYING_COST_INPUTS });
    setTransferScenario("");
    window.sessionStorage.removeItem(CARRYING_COST_TRANSFER_KEY);
  }

  function transferCosts() {
    if (!transferScenario) return;
    window.sessionStorage.setItem(CARRYING_COST_TRANSFER_KEY, JSON.stringify({ scenario: transferScenario, amountCents: result.holdingTotal }));
    track("carrying_calculator_transfer", { location: "carrying_cost_calculator", destination: "/tools/home-sale-net-proceeds-calculator" });
    router.push("/tools/home-sale-net-proceeds-calculator");
  }

  return <section className="calculator-shell carrying-shell" aria-labelledby="carrying-calculator-title">
    <div className="calculator-heading"><div><p className="eyebrow">HYPOTHETICAL EXAMPLE</p><h2 id="carrying-calculator-title">Estimate monthly and total costs</h2><p>Change any amount or the holding period. Your entries stay in this browser page and are not submitted or saved.</p></div><button className="button button-secondary calculator-reset" type="button" onClick={resetExample}><RotateCcw size={17} /> Reset Example</button></div>
    <div className="carrying-layout">
      <fieldset className="carrying-inputs"><legend>Monthly expenses</legend><div className="carrying-field-grid">{carryingCostFields.map(([field, label]) => <label className="calculator-field" htmlFor={`carrying-${field}`} key={field}><span>{label}</span><span className="currency-input-wrap"><span aria-hidden="true">$</span><input id={`carrying-${field}`} type="number" inputMode="decimal" min="0" step="1" value={values[field]} onChange={(event) => update(field, normalizeCurrencyEntry(event.target.value))} onBlur={() => values[field] === "" && update(field, "0")} /></span></label>)}</div><div className="holding-period"><label htmlFor="holding-months">Holding period</label><div><input id="holding-months-range" aria-label="Holding period slider" type="range" min="1" max="24" step="1" value={normalizeHoldingMonths(values.months)} onChange={(event) => update("months", event.target.value)} /><span><input id="holding-months" aria-label="Holding period in months" type="number" inputMode="numeric" min="1" max="24" step="1" value={values.months} onChange={(event) => update("months", event.target.value === "" ? "" : String(normalizeHoldingMonths(event.target.value)))} onBlur={() => update("months", String(normalizeHoldingMonths(values.months)))} /><span>months</span></span></div></div></fieldset>
      <div className="carrying-results" aria-live="polite" aria-atomic="true"><p className="eyebrow">ESTIMATED COSTS</p><div className="carrying-totals"><div><span>Monthly carrying cost</span><strong data-testid="monthly-carrying-total">{formatUsd(result.monthlyTotal)}</strong></div><div><span>{result.months}-month holding cost</span><strong data-testid="holding-cost-total">{formatUsd(result.holdingTotal)}</strong></div></div><p className="carrying-accounting-note"><strong>Cash-flow note:</strong> Mortgage payments may include principal that reduces the loan balance. This tool estimates cash outflow, not pure economic loss. Do not double-count taxes or insurance already included in an escrow payment.</p></div>
    </div>
    <div className="carrying-breakdown"><div><h3>Monthly expense breakdown</h3><ul>{carryingCostFields.map(([field, label]) => <li key={field}><span>{label}</span><strong>{formatUsd(result.items[field])}</strong></li>)}</ul></div><div className="carrying-chart" role="img" aria-label={`Monthly expense comparison. ${carryingCostFields.map(([field, label]) => `${label}: ${formatUsd(result.items[field])}`).join("; ")}.`}>{carryingCostFields.map(([field, label]) => <div key={field}><span>{label}</span><span className="carrying-bar-track"><span className="carrying-bar" style={{ width: `${(result.items[field] / largestExpense) * 100}%` }} /></span></div>)}</div></div>
    <p className="calculator-disclaimer">This calculator provides hypothetical budgeting estimates based on your entries. It is not financial, tax, legal, or real estate advice. Actual expenses vary by property and circumstances.</p>
    <div className="carrying-transfer"><div><h3>Use this estimate in another comparison</h3><p>Choose the one net-proceeds scenario that should receive the {formatUsd(result.holdingTotal)} total. The destination remains fully editable.</p></div><fieldset><legend>Apply total holding cost to</legend><div className="choice-row"><label><input type="radio" name="transferScenario" value="repair" checked={transferScenario === "repair"} onChange={(event) => setTransferScenario(event.target.value)} /> Repair and list</label><label><input type="radio" name="transferScenario" value="asIs" checked={transferScenario === "asIs"} onChange={(event) => setTransferScenario(event.target.value)} /> Sell as-is</label></div></fieldset><button className="button" type="button" onClick={transferCosts} disabled={!transferScenario}>Use These Costs in Net Proceeds Calculator</button></div>
    <div className="carrying-actions"><button className="button button-secondary" type="button" onClick={() => window.print()}><Printer size={17} /> Print Summary</button></div>
  </section>;
}
