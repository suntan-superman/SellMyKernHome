const steps = [
  ["01", "Tell us about your property", "Start with the address and the best way to reach you. Add more context only if you want to."],
  ["02", "We review your situation", "Authorized Sell My Kern Home administrators review the information. External sharing remains off unless you separately consent and an identified approved recipient is available."],
  ["03", "Discuss possible next steps", "We contact you to learn more. Any independent recipient must identify its own role and terms, and you remain free to decline."],
];

export default function Process() { return <div className="process-grid">{steps.map(([number, title, body]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}</div>; }

