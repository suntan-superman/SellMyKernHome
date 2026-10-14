import { Archive, Hammer, KeyRound, MapPinned, Truck } from "lucide-react";

export const situations = [
  { slug: "inherited-property", title: "Inherited property", short: "Understand practical questions to organize before deciding what comes next.", icon: Archive,
    intro: "An inherited home can come with paperwork, family decisions, belongings, repairs, and an unfamiliar timeline. A calm first conversation can help you sort the property facts from the decisions that still require legal or tax guidance.",
    points: ["Who has authority to make decisions about the property", "Whether the home is occupied and how belongings will be handled", "Known repairs, liens, or maintenance needs", "The timing and priorities shared by the people involved"],
    note: "We do not provide probate, tax, or legal advice. An estate attorney and qualified tax professional can explain your obligations before you sign an agreement." },
  { slug: "house-needs-repairs", title: "House needs repairs", short: "Make a clear inventory of condition, priorities, and realistic paths forward.", icon: Hammer,
    intro: "A roof, plumbing, foundation, or long list of deferred projects can make a sale feel complicated. You do not need a perfect repair estimate before starting a conversation.",
    points: ["Separate urgent safety issues from cosmetic work", "Collect any inspections, estimates, or permits you already have", "Consider the cost and time of repairs alongside potential sale paths", "Disclose known material facts as required"],
    note: "No particular sale outcome or property condition is guaranteed. Get independent estimates and advice when they would help you compare options." },
  { slug: "rental-property", title: "Rental property", short: "Discuss occupancy, condition, records, and timing with care.", icon: KeyRound,
    intro: "Selling a rental property involves both the home and the people and agreements connected to it. A useful conversation begins with accurate occupancy and lease information.",
    points: ["Current lease terms and security-deposit records", "Required notices and tenant rights", "Property condition and maintenance history", "Your preferred timing and tax questions for a professional"],
    note: "Landlord-tenant and tax rules can be situation-specific. Consult qualified California professionals before taking action." },
  { slug: "vacant-property", title: "Vacant home", short: "Review security, upkeep, condition, and your desired timeline.", icon: MapPinned,
    intro: "A vacant home still needs attention. Insurance, maintenance, utilities, security, and travel can all shape what a practical next step looks like.",
    points: ["Current insurance and utility status", "Security, yard care, and periodic property checks", "Known damage or deferred maintenance", "Access arrangements for any future inspection or walkthrough"],
    note: "Avoid sharing access codes, keys, or sensitive security details through this website." },
  { slug: "relocating", title: "Relocating", short: "Plan around your move, property readiness, and decision timeline.", icon: Truck,
    intro: "A move for work, family, or a new chapter can create competing deadlines. Your property plan should start with the dates you know and the flexibility you need.",
    points: ["Your move date and whether the home will become vacant", "Repairs or packing that may affect readiness", "Documents and decision-makers who need to be available", "A backup plan if your preferred timing changes"],
    note: "Timelines depend on the property, transaction path, and third parties. We do not promise a closing date before reviewing the details." },
];

export function getSituation(slug) { return situations.find((item) => item.slug === slug); }

