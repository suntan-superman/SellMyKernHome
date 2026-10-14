const steps = [
  ["01", "Tell us about your property", "Start with the address and the best way to reach you. Add more context only if you want to."],
  ["02", "We review your situation", "We look at the information you share and prepare for a useful, property-specific conversation."],
  ["03", "Discuss possible next steps", "We contact you to learn more, answer what we can, and discuss potential paths without pressure."],
];

export default function Process() { return <div className="process-grid">{steps.map(([number, title, body]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}</div>; }

