export interface Question {
  id: number;
  text: string;
}

export interface Dimension {
  id: string;
  name: string;
  subtitle: string;
  questions: Question[];
  threshold: number; // score at or below this = show reflection
  reflection: string;
  reflectionPrompt: string;
}

export type Status = "green" | "amber" | "red";

export interface DimensionResult {
  dimension: Dimension;
  score: number;
  maxScore: number;
  status: Status;
  percentage: number;
}

export interface PatternInterpretation {
  id: string;
  label: string;
  description: string;
  condition: (results: DimensionResult[]) => boolean;
}

export const DIMENSIONS: Dimension[] = [
  {
    id: "problem-legitimacy",
    name: "Problem Legitimacy",
    subtitle:
      "Is this problem real, specific, and organisationally grounded — or is this innovation theatre?",
    questions: [
      {
        id: 1,
        text: "I can state the problem this initiative addresses in measurable terms — time, cost, error rate, or revenue impact — not in innovation language or strategic aspiration.",
      },
      {
        id: 2,
        text: "The person who experiences this problem daily has confirmed, in their own words, that it is a genuine operational pain — not something surfaced by the innovation team alone.",
      },
      {
        id: 3,
        text: "This problem has been attempted before inside the organisation, and I can explain specifically what failed and why — or I can confirm it has never been attempted, and explain why not.",
      },
    ],
    threshold: 1,
    reflection:
      "You may be solving a problem the organisation finds strategically interesting but operationally irrelevant. The most common corporate innovation failure: the initiative aligns with the strategy deck but not with anyone's daily work. If the problem can't be stated in operational language by the person who feels it, the initiative lacks the organisational gravity to survive its first governance review.",
    reflectionPrompt:
      "Ask yourself: if this initiative disappeared tomorrow, who inside the organisation would notice — and what would they actually lose?",
  },
  {
    id: "stakeholder-architecture",
    name: "Stakeholder Architecture",
    subtitle:
      "Have you mapped the power structure around this initiative — including those who benefit from the status quo?",
    questions: [
      {
        id: 4,
        text: "I can name the person who will decide whether this initiative proceeds past the pilot — by name and title. This is not the person who championed the idea.",
      },
      {
        id: 5,
        text: "I can name the person or team who will need to change their daily work if this initiative succeeds. They have been consulted, not just informed.",
      },
      {
        id: 6,
        text: "I have identified at least one person or function that benefits from the current way of doing things — and I understand their specific objection or risk.",
      },
      {
        id: 7,
        text: 'The executive sponsor is actively engaged — attending reviews, removing blockers, spending political capital — not just "aware" or "supportive in principle."',
      },
    ],
    threshold: 2,
    reflection:
      "Your initiative likely has support from the wrong people or insufficient engagement from the right ones. In complex organisations, the person championing the innovation rarely controls the budget, the process change, or the political landscape needed to make it stick. If your executive sponsor is supportive but passive, they're a spectator, not a sponsor.",
    reflectionPrompt:
      "Map the difference between who wants this initiative to succeed and who needs to act for it to succeed. If those are different people, you have a coalition gap.",
  },
  {
    id: "organisational-feasibility",
    name: "Organisational Feasibility",
    subtitle:
      "Can your organisation's machinery actually accommodate this initiative — or will the immune system reject it?",
    questions: [
      {
        id: 8,
        text: "A business owner from the affected unit — not IT, not the innovation team — has taken ownership of this initiative's success or failure within their function.",
      },
      {
        id: 9,
        text: "The technical integration requirements are scoped: I know which systems are involved, who owns them, and whether those teams have capacity to support the integration.",
      },
      {
        id: 10,
        text: "Security, compliance, and data governance reviews have been initiated — not necessarily completed, but I know the timeline and no showstoppers have been identified.",
      },
      {
        id: 11,
        text: 'Dedicated resources — people with protected time, not "when available" participation — are assigned to this initiative.',
      },
    ],
    threshold: 2,
    reflection:
      "Your initiative has no structural foundation inside the organisation. Without a business owner, without scoped technical integration, and without dedicated resources, even a brilliant pilot will stall at the first cross-functional dependency. This is the most common invisible killer of corporate innovation: the initiative exists in an organisational vacuum.",
    reflectionPrompt:
      "Ask yourself: whose calendar reflects this initiative as a priority? If it's only the innovation team's, the organisation hasn't actually committed.",
  },
  {
    id: "internal-value-adoption",
    name: "Internal Value & Adoption",
    subtitle:
      "Will this pilot become operational reality — or remain a successful experiment that goes nowhere?",
    questions: [
      {
        id: 12,
        text: "I can state the value this initiative delivers in terms the internal customer uses — not innovation metrics, not strategy language, but the vocabulary of the team that will adopt it.",
      },
      {
        id: 13,
        text: "The adoption cost for the internal customer — time, workflow changes, learning curve, political exposure — has been estimated honestly and discussed with them.",
      },
      {
        id: 14,
        text: 'I know which budget line or resource allocation will fund this initiative beyond the pilot phase. Not "we\'ll figure it out" — a specific, named source.',
      },
      {
        id: 15,
        text: "There are explicit criteria — agreed with stakeholders, not defined unilaterally — for what constitutes success at the end of the pilot and what triggers a go/no-go decision.",
      },
    ],
    threshold: 2,
    reflection:
      "You're at risk of the 'successful pilot that goes nowhere.' The technology works. The demo is impressive. But nobody has committed to adoption, the funding path is unclear, and there are no agreed criteria for what triggers the next step. This is where most corporate innovation initiatives die — not from failure, but from the absence of a mechanism to convert success into operational reality.",
    reflectionPrompt:
      "The people who watch the demo are not the people who change their workflow. Have you engaged both?",
  },
  {
    id: "delivery-scope-integrity",
    name: "Delivery & Scope Integrity",
    subtitle:
      "Can the organisation deliver within the constraints it has set — and are those constraints clearly defined?",
    questions: [
      {
        id: 16,
        text: "There is a clear scope boundary — what is in, what is explicitly out, and what is deferred to a later phase. This has been documented and agreed, not just discussed.",
      },
      {
        id: 17,
        text: "The pilot has a defined duration with a hard end date, and the go/no-go decision process at that date has been agreed in advance.",
      },
      {
        id: 18,
        text: "The initiative can deliver its core value proposition with currently available resources and capabilities — no critical dependency on hiring, procurement, or technology decisions that haven't been made yet.",
      },
    ],
    threshold: 1,
    reflection:
      "Scope creep, unbounded timelines, and unfulfilled dependencies will erode the initiative's credibility before results can speak for themselves. Corporate pilots that don't have hard boundaries become permanent experiments — they never fail, but they never resolve into decisions either.",
    reflectionPrompt:
      "What have you explicitly excluded from this pilot? If you can't answer immediately, scope is already creeping.",
  },
];

export const PATTERN_INTERPRETATIONS: PatternInterpretation[] = [
  {
    id: "innovation-theatre",
    label: "Innovation Theatre",
    description:
      "Strong execution apparatus, but the problem itself isn't grounded in operational reality. The initiative has structural support, stakeholder engagement, and delivery capability — but the foundational question hasn't been answered: is this a real problem that someone inside the organisation actually needs solved? Without problem legitimacy, the initiative will look good in progress reports but fail to generate lasting change.",
    condition: (results) => {
      const pl = results.find(
        (r) => r.dimension.id === "problem-legitimacy"
      );
      const others = results.filter(
        (r) => r.dimension.id !== "problem-legitimacy"
      );
      return (
        pl !== undefined &&
        pl.status === "red" &&
        others.filter((r) => r.status === "green").length >= 2
      );
    },
  },
  {
    id: "pilot-to-nowhere",
    label: "Pilot-to-Nowhere Risk",
    description:
      "Everything is set up well except the mechanism to convert a successful pilot into operational adoption. The problem is real, the stakeholders are engaged, and the delivery plan is sound — but there's no agreed path from pilot to permanence. No budget identified, no success criteria agreed, no adoption cost estimated. This is the single most common corporate innovation death: not failure, but the absence of a conversion mechanism.",
    condition: (results) => {
      const iva = results.find(
        (r) => r.dimension.id === "internal-value-adoption"
      );
      const others = results.filter(
        (r) => r.dimension.id !== "internal-value-adoption"
      );
      return (
        iva !== undefined &&
        iva.status === "red" &&
        others.filter((r) => r.status === "green").length >= 3
      );
    },
  },
  {
    id: "sponsor-vacuum",
    label: "Sponsor Vacuum",
    description:
      "The initiative is strong on substance but weak on political sponsorship. Problem legitimacy, feasibility, adoption path, and delivery are all in place — but the stakeholder architecture is fragile. If your champion leaves, gets reorganised, or loses influence, the initiative loses its internal advocacy. A single executive rotation could kill it.",
    condition: (results) => {
      const sa = results.find(
        (r) => r.dimension.id === "stakeholder-architecture"
      );
      const others = results.filter(
        (r) => r.dimension.id !== "stakeholder-architecture"
      );
      return (
        sa !== undefined &&
        sa.status === "red" &&
        others.every((r) => r.status === "green")
      );
    },
  },
  {
    id: "organisational-antibodies",
    label: "Organisational Antibodies",
    description:
      "The problem is real, but the organisation's systems, governance, or immune response are blocking progress. This pattern emerges when a legitimate initiative encounters procedural resistance, resource competition, or passive waiting from the functions it depends on. The problem isn't the idea — it's the organisational machinery surrounding it.",
    condition: (results) => {
      const of_ = results.find(
        (r) => r.dimension.id === "organisational-feasibility"
      );
      const pl = results.find(
        (r) => r.dimension.id === "problem-legitimacy"
      );
      return (
        of_ !== undefined &&
        pl !== undefined &&
        of_.status === "red" &&
        pl.status === "green"
      );
    },
  },
  {
    id: "universally-low",
    label: "Universally Low",
    description:
      "Significant gaps across multiple dimensions. This isn't a sequencing problem — it's a readiness problem. The initiative may need to step back and address foundational questions before proceeding. Consider whether the right preconditions exist for this initiative to succeed in its current form.",
    condition: (results) => {
      const totalScore = results.reduce((sum, r) => sum + r.score, 0);
      return totalScore <= 8;
    },
  },
];

export const COI_COPY = {
  heading: "The Cost of Ignoring",
  intro:
    "Most innovation teams calculate the potential return on their initiative. Few calculate the COI — the Cost of Ignoring — what each unaddressed gap is quietly costing the organisation.",
  body: 'Every "no" in this diagnostic is a compounding risk: one that gets more expensive the longer it goes unaddressed, and harder to fix once the initiative has built momentum in the wrong direction.',
};

export const CTA_COPY = {
  heading: "What This Diagnostic Doesn't Tell You",
  body: `This tool reveals where your innovation initiative is structurally at risk. It doesn't tell you how to address those risks — because the answer depends on your specific organisational context, your stakeholder landscape, and where you are in the initiative lifecycle.

Each stage of the corporate innovation journey requires a different capability. Problem legitimacy. Stakeholder coalition-building. Organisational integration. Adoption design. Teams that are strong at one stage are often stuck at the next — because it requires a completely different organisational muscle.`,
  callout:
    "If your profile shows two or more dimensions in the red zone, a structured conversation can help you identify the binding constraint and decide what to prioritise.",
  contact: {
    name: "Alexandra N.",
    title: "Founder, Aieutics",
    subtitle: "Executive coaching & strategic transformation",
    website: "aieutics.com",
    email: "hello@aieutics.com",
  },
};

export const ATTRIBUTION =
  "Developed by Aieutics from patterns observed across executive coaching, corporate accelerator programmes, and consulting engagements with corporate innovation teams.";
