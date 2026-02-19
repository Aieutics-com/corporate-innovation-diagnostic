export interface ClassificationOption {
  value: "A" | "B" | "C";
  label: string;
  description: string;
}

export interface ClassificationQuestion {
  id: number;
  text: string;
  options: ClassificationOption[];
}

export type ClassificationType = "optimisation" | "adjacency" | "transformation";

export interface ClassificationResult {
  type: ClassificationType;
  label: string;
  description: string;
  implications: string[];
}

export const CLASSIFICATION_QUESTIONS: ClassificationQuestion[] = [
  {
    id: 1,
    text: "How many teams or functions are directly involved in this initiative?",
    options: [
      {
        value: "A",
        label: "1-2 teams",
        description:
          "The initiative sits within a single function or involves one team and their direct manager.",
      },
      {
        value: "B",
        label: "3-8 across 2-3 functions",
        description:
          "Multiple functions are involved — the initiative crosses departmental boundaries.",
      },
      {
        value: "C",
        label: "8+ across the organisation",
        description:
          "The initiative touches multiple divisions, potentially including C-suite involvement.",
      },
    ],
  },
  {
    id: 2,
    text: "Do existing performance incentives support or conflict with this initiative?",
    options: [
      {
        value: "A",
        label: "Support it",
        description:
          "Everyone involved benefits from the initiative succeeding. Existing KPIs and bonuses align with the change.",
      },
      {
        value: "B",
        label: "Mixed",
        description:
          "Some stakeholders benefit, others are neutral or mildly threatened. Incentive misalignment exists but isn't dominant.",
      },
      {
        value: "C",
        label: "Actively conflict",
        description:
          "The people who need to change are being rewarded for the status quo. Existing incentives work against the initiative.",
      },
    ],
  },
  {
    id: 3,
    text: "Where does funding for this initiative come from?",
    options: [
      {
        value: "A",
        label: "Existing operational budgets",
        description:
          "Funded from the team's or department's normal operating budget. No special allocation needed.",
      },
      {
        value: "B",
        label: "Dedicated project or innovation budget",
        description:
          "Requires a specific budget allocation from a central innovation fund or project budget.",
      },
      {
        value: "C",
        label: "Executive-sponsored investment",
        description:
          "Requires distinct governance, patient capital, and senior executive sponsorship for funding.",
      },
    ],
  },
  {
    id: 4,
    text: "Does this initiative challenge who the organisation believes it is?",
    options: [
      {
        value: "A",
        label: "No",
        description:
          "The initiative improves how the organisation already works. It doesn't question the core identity or business model.",
      },
      {
        value: "B",
        label: "Somewhat",
        description:
          "The initiative extends into a new domain or capability that stretches the organisation's self-image.",
      },
      {
        value: "C",
        label: "Fundamentally",
        description:
          "The initiative challenges the organisation's core identity, business model, or market positioning.",
      },
    ],
  },
  {
    id: 5,
    text: "If this initiative were cancelled tomorrow, could the organisation revert to the previous state?",
    options: [
      {
        value: "A",
        label: "Yes, easily",
        description:
          "The initiative is fully reversible. Cancelling it would have no lasting impact on structures or capabilities.",
      },
      {
        value: "B",
        label: "Partially",
        description:
          "Some investments are sunk and some changes are hard to undo, but the core business is unaffected.",
      },
      {
        value: "C",
        label: "No — too much has changed",
        description:
          "The organisation has restructured around this initiative. Reverting would be costly and disruptive.",
      },
    ],
  },
];

export const CLASSIFICATION_RESULTS: Record<
  ClassificationType,
  ClassificationResult
> = {
  optimisation: {
    type: "optimisation",
    label: "Optimisation",
    description:
      "Your initiative is improving an existing process, product, or capability within the current business model. The organisational structures, incentive systems, and decision-making processes are largely unchanged. The innovation is additive, not disruptive.",
    implications: [
      "Timeline: 3-12 months from classification to embedding",
      "Stakeholder complexity is low — typically 1-2 decision-makers",
      "Existing incentives generally support the initiative",
      "The initiative is fully reversible if needed",
      "Governance: standard operational oversight is sufficient",
    ],
  },
  adjacency: {
    type: "adjacency",
    label: "Adjacency",
    description:
      "Your initiative extends into a neighbouring domain — a new customer segment, a new application of existing technology, or a new business model for an existing product. The core capabilities transfer, but organisational structures need modification and new stakeholders enter the picture.",
    implications: [
      "Timeline: 6-24 months from classification to embedding",
      "Stakeholder complexity is moderate — 3-8 stakeholders across 2-3 functions",
      "Incentive alignment is mixed — some stakeholders benefit, others are neutral or mildly threatened",
      "Partially reversible — some investments are sunk",
      "Governance: dedicated project governance with cross-functional coordination required",
    ],
  },
  transformation: {
    type: "transformation",
    label: "Transformation",
    description:
      "Your initiative fundamentally changes how the organisation operates in a domain. It requires new capabilities, new structures, and potentially new culture. The initiative may challenge existing power structures and could cannibalise existing revenue or ways of working.",
    implications: [
      "Timeline: 18-48 months from classification to embedding",
      "Stakeholder complexity is high — 8+ stakeholders including C-suite",
      "Existing incentives actively work against the initiative",
      "Largely irreversible once past the feasibility stage",
      "Governance: executive-sponsored with distinct governance structure and patient capital",
    ],
  },
};

export function classify(
  answers: Record<number, "A" | "B" | "C">
): ClassificationType {
  const counts = { A: 0, B: 0, C: 0 };
  Object.values(answers).forEach((v) => {
    counts[v]++;
  });

  if (counts.C >= counts.B && counts.C >= counts.A) return "transformation";
  if (counts.B >= counts.A) return "adjacency";
  return "optimisation";
}
