"use client";

import Link from "next/link";
import { Printer, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import {
  DEFAULT_NET_PROCEEDS_INPUTS,
  calculateNetProceeds,
  formatUsd,
} from "@/lib/net-proceeds";

const currencyMaximum = 100_000_000;

function normalizeEntry(value, maximum) {
  if (value === "") return "";
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return "0";
  return String(Math.min(number, maximum));
}

function CurrencyInput({ id, label, value, onChange, help }) {
  return <label className="calculator-field" htmlFor={id}>
    <span>{label}</span>
    <span className="currency-input-wrap"><span aria-hidden="true">$</span><input id={id} type="number" inputMode="decimal" min="0" max={currencyMaximum} step="100" value={value} onChange={(event) => onChange(normalizeEntry(event.target.value, currencyMaximum))} onBlur={() => value === "" && onChange("0")} /></span>
    {help ? <small>{help}</small> : null}
  </label>;
}

function PercentInput({ id, label, value, onChange }) {
  const normalizedValue = value === "" ? 0 : Number(value);
  return <div className="calculator-field">
    <label htmlFor={id}><span>{label}</span></label>
    <div className="percentage-controls">
      <input id={`${id}-range`} aria-label={`${label} slider`} type="range" min="0" max="25" step="0.1" value={Math.min(normalizedValue, 25)} onChange={(event) => onChange(event.target.value)} />
      <span className="percentage-input-wrap"><input id={id} aria-label={label} type="number" inputMode="decimal" min="0" max="100" step="0.1" value={value} onChange={(event) => onChange(normalizeEntry(event.target.value, 100))} onBlur={() => value === "" && onChange("0")} /><span aria-hidden="true">%</span></span>
    </div>
  </div>;
}

function LineItem({ label, cents, subtraction = false, total = false }) {
  const prefix = subtraction || cents < 0 ? "−" : "";
  return <li className={total ? "calculation-total" : undefined}><span>{label}</span><strong>{prefix}{formatUsd(Math.abs(cents))}</strong></li>;
}

export default function NetProceedsCalculator() {
  const [values, setValues] = useState(DEFAULT_NET_PROCEEDS_INPUTS);
  const viewTracked = useRef(false);
  const interactionTracked = useRef(false);
  const result = useMemo(() => calculateNetProceeds(values), [values]);

  useEffect(() => {
    if (viewTracked.current) return;
    viewTracked.current = true;
    track("calculator_view", { location: "net_proceeds_calculator" });
  }, []);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    if (!interactionTracked.current) {
      interactionTracked.current = true;
      track("calculator_interaction", { location: "net_proceeds_calculator" });
    }
  }

  function resetExample() {
    setValues({ ...DEFAULT_NET_PROCEEDS_INPUTS });
  }

  const winner = result.difference > 0
    ? `Repairing and listing currently estimates ${formatUsd(result.difference)} more in proceeds.`
    : result.difference < 0
      ? `Selling as-is currently estimates ${formatUsd(Math.abs(result.difference))} more in proceeds.`
      : "Both scenarios currently estimate the same proceeds.";
  const chartMaximum = Math.max(Math.abs(result.repairAndListNet), Math.abs(result.asIsNet), 1);
  const repairBarWidth = `${Math.max(2, (Math.abs(result.repairAndListNet) / chartMaximum) * 100)}%`;
  const asIsBarWidth = `${Math.max(2, (Math.abs(result.asIsNet) / chartMaximum) * 100)}%`;

  return <section className="calculator-shell" aria-labelledby="calculator-title">
    <div className="calculator-heading">
      <div><p className="eyebrow">HYPOTHETICAL EXAMPLE</p><h2 id="calculator-title">Compare your assumptions</h2><p>Change any number below. Your entries stay in this browser page and are not submitted or saved.</p></div>
      <button className="button button-secondary calculator-reset" type="button" onClick={resetExample}><RotateCcw size={17} /> Reset Example</button>
    </div>
    <div className="calculator-scenarios">
      <fieldset className="calculator-card">
        <legend><span>Scenario A</span>Repair and list</legend>
        <CurrencyInput id="repair-sale-price" label="Expected sale price" value={values.repairSalePrice} onChange={(value) => update("repairSalePrice", value)} />
        <CurrencyInput id="repair-budget" label="Estimated repair budget" value={values.repairBudget} onChange={(value) => update("repairBudget", value)} />
        <PercentInput id="repair-selling-rate" label="Estimated selling expenses" value={values.repairSellingExpenseRate} onChange={(value) => update("repairSellingExpenseRate", value)} />
        <CurrencyInput id="repair-carrying-costs" label="Estimated carrying costs" value={values.repairCarryingCosts} onChange={(value) => update("repairCarryingCosts", value)} />
      </fieldset>
      <fieldset className="calculator-card">
        <legend><span>Scenario B</span>Sell as-is</legend>
        <CurrencyInput id="as-is-sale-price" label="Hypothetical as-is sale price" value={values.asIsSalePrice} onChange={(value) => update("asIsSalePrice", value)} />
        <PercentInput id="as-is-selling-rate" label="Estimated selling expenses" value={values.asIsSellingExpenseRate} onChange={(value) => update("asIsSellingExpenseRate", value)} />
        <CurrencyInput id="as-is-carrying-costs" label="Estimated carrying costs" value={values.asIsCarryingCosts} onChange={(value) => update("asIsCarryingCosts", value)} />
      </fieldset>
    </div>
    <div className="calculator-shared-input">
      <CurrencyInput id="mortgage-payoff" label="Outstanding mortgage and lien payoff (optional)" value={values.mortgagePayoff} onChange={(value) => update("mortgagePayoff", value)} help="The same payoff is subtracted from both scenarios. It changes estimated cash proceeds but not which scenario is higher." />
    </div>
    <div className="calculator-results">
      <div className="result-summary" aria-live="polite" aria-atomic="true">
        <p className="eyebrow">ESTIMATED RESULTS</p>
        <div className="result-totals">
          <div><span>Repair and list</span><strong data-testid="repair-net">{formatUsd(result.repairAndListNet)}</strong></div>
          <div><span>Sell as-is</span><strong data-testid="as-is-net">{formatUsd(result.asIsNet)}</strong></div>
          <div><span>Difference</span><strong data-testid="difference">{formatUsd(result.difference)}</strong></div>
        </div>
        <p className="result-explanation" data-testid="winner-explanation">{winner}</p>
      </div>
      <div className="result-chart" role="img" aria-label={`Visual comparison: repair and list ${formatUsd(result.repairAndListNet)}; sell as-is ${formatUsd(result.asIsNet)}.`}>
        <div><span>Repair and list</span><span className={`result-bar ${result.repairAndListNet < 0 ? "result-bar-negative" : ""}`} style={{ width: repairBarWidth }} /></div>
        <div><span>Sell as-is</span><span className={`result-bar result-bar-alt ${result.asIsNet < 0 ? "result-bar-negative" : ""}`} style={{ width: asIsBarWidth }} /></div>
      </div>
      <p className="calculator-insight"><strong>Why net proceeds matter:</strong> A higher selling price does not necessarily produce a higher net result after repairs, selling expenses, carrying costs, and payoffs.</p>
      <p className="calculator-disclaimer">This calculator provides hypothetical estimates based on the numbers you enter. It is not an appraisal, purchase offer, guarantee, or real estate, legal, tax, or financial advice. Actual proceeds depend on the property, transaction terms, closing costs, taxes, liens, and other expenses. Selling expenses, including real estate commissions, are negotiable.</p>
      <div className="calculator-actions"><button className="button button-secondary print-button" type="button" onClick={() => window.print()}><Printer size={17} /> Print Summary</button><Link className="button" href="/#property-form" data-analytics-event="calculator_cta_click" data-analytics-location="net_proceeds_results">Want to explore your selling options? Tell us about your property.</Link></div>
      <p className="no-obligation">No obligation to sell.</p>
      <details className="calculation-details">
        <summary>View calculation details</summary>
        <div className="calculation-breakdowns">
          <article><h3>Repair-and-list calculation</h3><ul><LineItem label="Expected sale price" cents={result.repairAndList.salePrice} /><LineItem label="Repair budget" cents={result.repairAndList.repairBudget} subtraction /><LineItem label="Selling expenses" cents={result.repairAndList.sellingExpenses} subtraction /><LineItem label="Carrying costs" cents={result.repairAndList.carryingCosts} subtraction /><LineItem label="Mortgage and lien payoff" cents={result.repairAndList.mortgagePayoff} subtraction /><LineItem label="Estimated proceeds" cents={result.repairAndListNet} total /></ul></article>
          <article><h3>As-is calculation</h3><ul><LineItem label="Hypothetical sale price" cents={result.asIs.salePrice} /><LineItem label="Selling expenses" cents={result.asIs.sellingExpenses} subtraction /><LineItem label="Carrying costs" cents={result.asIs.carryingCosts} subtraction /><LineItem label="Mortgage and lien payoff" cents={result.asIs.mortgagePayoff} subtraction /><LineItem label="Estimated proceeds" cents={result.asIsNet} total /></ul></article>
        </div>
      </details>
    </div>
  </section>;
}
