export const articles = [
  {
    slug: "selling-a-house-as-is-bakersfield",
    title: "What to Consider Before Selling a House As-Is in Bakersfield",
    description: "A practical checklist for comparing repair decisions, disclosures, estimates, timing, and professional advice before an as-is sale.",
    published: "2026-10-14",
    sections: [
      ["Start by defining what “as-is” means in the conversation", ["People often use “as-is” to mean that a seller does not plan to complete repairs before closing. The phrase does not erase disclosure duties or make every property and transaction identical. Ask any prospective buyer or representative to explain in writing what inspections, access, contingencies, credits, and repair requests may still be involved."]],
      ["Make a factual condition inventory", ["List what you know about major systems such as the roof, electrical, plumbing, heating and cooling, foundation, water intrusion, and permitted additions. Gather existing reports, invoices, warranties, and permits. Avoid guessing about issues you have not evaluated.", "A pre-sale inspection or contractor estimate can sometimes make comparison easier, but the right approach depends on the property and your priorities. Independent professionals can help you understand scope and cost."]],
      ["Compare more than the headline price", ["When comparing potential paths, consider expected proceeds, preparation costs, holding costs, time, contingencies, professional fees, and uncertainty. Request written terms and do not rely on a verbal summary.", "A faster or simpler process may carry a different price or set of terms. There is no universal best path for every owner."]],
      ["Plan for California disclosures and independent advice", ["California property disclosures can be detailed and situation-specific. “As-is” wording does not necessarily remove a seller’s disclosure responsibilities. Ask a qualified California real-estate attorney or licensed professional which forms and facts apply to you."]],
      ["Questions to bring to a property conversation", ["Who would be the buyer or contracting party?", "Are there inspection, financing, assignment, or other contingencies?", "Which costs would each party pay?", "What happens if the closing date changes?", "Can I review the agreement with my own attorney before signing?"]],
    ],
  },
  {
    slug: "questions-before-signing-property-purchase-agreement",
    title: "Questions to Ask Before Signing a Property Purchase Agreement",
    description: "A plain-language list of questions about the parties, price, contingencies, assignments, costs, deadlines, and independent review.",
    published: "2026-10-14",
    sections: [
      ["Identify the parties and their roles", ["Confirm the exact legal name of the buyer and any representative involved. Ask whether the person you are speaking with is the buyer, an agent, a wholesaler, an intermediary, or acting in another role. If a license or brokerage relationship is mentioned, verify how it applies to your transaction."]],
      ["Understand the price and every adjustment", ["Read how the purchase price is stated and whether credits, prorations, liens, repairs, fees, or other deductions can change what you receive. Ask for a written estimate of seller proceeds from an appropriate closing professional when available."]],
      ["Review contingencies and cancellation rights", ["Look for inspection, financing, title, due-diligence, approval, or other contingencies. Ask who can cancel, for what reason, by which deadline, and what happens to any deposit. Do not assume that a short form is simple or risk-free."]],
      ["Ask about assignment or resale", ["Ask whether the agreement can be assigned to another party and whether the buyer expects to profit through an assignment or resale. California disclosure requirements and the practical consequences can depend on the transaction. Obtain legal advice if any term is unclear."]],
      ["Confirm dates, access, possession, and costs", ["Write down the intended closing date, when possession transfers, who can access the property, who selects escrow or title services, and who pays each cost. If flexibility was discussed, make sure the written agreement reflects it."]],
      ["Take time for independent review", ["Ask for a complete copy of every document and keep it. Do not sign blank or incomplete forms. A qualified California real-estate attorney can explain legal consequences; a tax professional can address tax questions; and a licensed real-estate professional can discuss market alternatives."]],
    ],
  },
];

export function getArticle(slug) { return articles.find((article) => article.slug === slug); }

