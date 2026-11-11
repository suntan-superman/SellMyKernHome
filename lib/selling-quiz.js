export const SELLING_QUIZ_CONTEXT_KEY = "smkh_selling_quiz_context";

export const sellingQuizQuestions = [
  { id: "condition", legend: "How would you describe the property's condition?", answers: [["ready", "Move-in ready"], ["minor", "Needs minor repairs"], ["major", "Needs major repairs"], ["unsure", "Not sure"]] },
  { id: "timeline", legend: "When would you ideally like to sell?", answers: [["soon", "As soon as practical"], ["one-to-three", "Within 1–3 months"], ["three-to-six", "Within 3–6 months"], ["exploring", "Just exploring"]] },
  { id: "inheritance", legend: "Does the property involve an inheritance or estate?", answers: [["no", "No"], ["settled", "Yes, ownership is already settled"], ["resolving", "Yes, ownership or probate is still being resolved"], ["unsure", "Not sure"]] },
  { id: "occupancy", legend: "Is anyone currently living in the property?", answers: [["owner", "Owner occupied"], ["tenant", "Tenant occupied"], ["vacant", "Vacant"], ["other", "Other / not sure"]] },
  { id: "mortgage", legend: "Are there any outstanding mortgages or liens?", answers: [["mortgage", "Mortgage only"], ["possible-liens", "Mortgage and possible additional liens"], ["none-known", "No known mortgage or liens"], ["unsure", "Not sure"]] },
  { id: "priority", legend: "What matters most to you?", answers: [["price", "Maximizing potential sale price"], ["repairs", "Avoiding repairs"], ["simplicity", "Reducing time and hassle"], ["options", "Understanding my options"]] },
];

const results = {
  traditional: {
    title: "Traditional listing may be worth exploring",
    explanation: "Your answers suggest the property may be relatively ready for market and that maximizing potential sale price matters to you. A licensed real-estate professional may help you evaluate listing preparation, market exposure, estimated expenses, and likely net proceeds. A listing does not guarantee a higher price or a particular timeline.",
    alternatives: ["Compare an as-is proposal using the same estimated costs and written terms.", "Use a net-proceeds comparison before deciding how much preparation is practical."],
    links: [["/sell-your-house-bakersfield", "Compare Bakersfield home-selling options"], ["/tools/home-sale-net-proceeds-calculator", "Estimate and compare net proceeds"]],
  },
  asIs: {
    title: "An as-is sale may be worth exploring",
    explanation: "Your answers suggest that repair work or process simplicity may be an important concern. Some buyers consider homes in their current condition. Compare the buyer's qualifications, inspections, contingencies, assignment terms, costs, and proposed timing rather than relying on a headline price or verbal promise.",
    alternatives: ["Ask a licensed agent what limited preparation and market exposure might involve.", "Compare written scenarios using realistic repair, carrying, and selling expenses."],
    links: [["/sell-house-as-is-bakersfield", "Understand selling a house as-is"], ["/insights/sell-as-is-or-repair-bakersfield", "Compare selling as-is with making repairs"]],
  },
  authority: {
    title: "Clarify ownership or estate authority first",
    explanation: "Your answers indicate that ownership, estate authority, or the applicable process may still be uncertain. Confirm who has authority to make decisions and which records or professional guidance are appropriate before relying on proposed transaction terms. This result does not determine that probate is required or that a sale is prohibited.",
    alternatives: ["Continue gathering property-condition and occupancy information while authority is clarified.", "After authority is understood, compare listing and as-is paths using complete written terms."],
    links: [["/selling-situations", "Review property-selling situations"], ["/sell-your-house-bakersfield", "Compare selling approaches"]],
  },
  compare: {
    title: "Compare your options",
    explanation: "Your answers contain a mix of priorities, so no single path clearly stands out. Compare likely net proceeds, preparation, contingencies, timing, buyer qualifications, and the responsibilities in each written option. Independent professional guidance may be useful where legal, tax, valuation, or real-estate questions arise.",
    alternatives: ["Explore what a traditional listing could require and what market exposure may provide.", "Review an as-is path without assuming it guarantees a price, cash offer, or closing date."],
    links: [["/sell-your-house-bakersfield", "Compare Bakersfield home-selling options"], ["/tools/home-sale-net-proceeds-calculator", "Use the net proceeds calculator"]],
  },
};

export function getSellingQuizResult(answers) {
  if (sellingQuizQuestions.some((question) => !answers[question.id])) return null;
  if (answers.inheritance === "resolving" || answers.inheritance === "unsure") return { key: "authority", ...results.authority };
  const listingCondition = answers.condition === "ready" || answers.condition === "minor";
  const flexibleTimeline = answers.timeline !== "soon";
  if (listingCondition && answers.priority === "price" && flexibleTimeline) return { key: "traditional", ...results.traditional };
  if (answers.condition === "major" && (answers.priority === "repairs" || answers.priority === "simplicity")) return { key: "asIs", ...results.asIs };
  if (answers.priority === "repairs" && answers.condition !== "ready") return { key: "asIs", ...results.asIs };
  return { key: "compare", ...results.compare };
}

export function getSellingQuizAnswerLabel(questionId, value) {
  return sellingQuizQuestions.find((question) => question.id === questionId)?.answers.find(([answerValue]) => answerValue === value)?.[1] || "";
}

export function buildSellingQuizSummary(answers) {
  return sellingQuizQuestions.map((question) => `${question.legend} ${getSellingQuizAnswerLabel(question.id, answers[question.id])}`).join("\n");
}
