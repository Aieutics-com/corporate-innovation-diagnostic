/**
 * Action prompts: 3-5 specific recommended next steps per dimension.
 * Shown when a dimension scores at or below its threshold (red/amber).
 * Keyed by dimension ID.
 */
export const ACTION_PROMPTS: Record<string, string[]> = {
  "problem-legitimacy": [
    "Interview the person who lives with this problem daily. Ask them to describe it in their own words — not in innovation language. If they can't, the problem isn't grounded.",
    "Rewrite the initiative's problem statement in operational terms: cost, time, error rate, or revenue impact. If you can't quantify it, it's an aspiration, not a problem.",
    "Document what happened the last time the organisation tried to solve this problem. If nothing was attempted, investigate why — the answer reveals the real organisational priority.",
  ],
  "stakeholder-architecture": [
    "Map the decision chain: who approves funding beyond the pilot, who changes their workflow if it succeeds, and who benefits from the status quo. These are three different people.",
    "Schedule a 30-minute session with your executive sponsor. Ask: 'What political capital have you spent on this initiative in the last month?' If the answer is none, you have a spectator, not a sponsor.",
    "Identify the person or function most likely to resist this initiative. Understand their objection. Resistance is data about what the initiative threatens.",
    "Create a stakeholder commitment matrix: for each key person, note their current engagement level (active, passive, unaware, resistant) and what you need from them.",
  ],
  "organisational-feasibility": [
    "Find a business owner in the affected unit willing to own the initiative's success within their function. If no one will, the initiative has no organisational anchor.",
    "List every system integration this initiative requires. For each, name the system owner and confirm their team's capacity. Unknown capacity is a blocker, not a detail.",
    "Initiate security, compliance, and data governance reviews now — even if they run in parallel with development. Late-stage compliance failures kill more initiatives than technical failures.",
    "Audit resource allocation: are people assigned with protected time, or 'when available'? If the latter, the organisation hasn't committed — it's just tolerating the initiative.",
  ],
  "internal-value-adoption": [
    "Translate the initiative's value into the vocabulary the internal customer uses. If you're using innovation metrics, you're talking to yourself.",
    "Estimate the adoption cost honestly: time to learn, workflow disruption, political exposure for the adopting team. Discuss this openly with them before the pilot ends.",
    "Identify the specific budget line that will fund this initiative post-pilot. 'We'll figure it out later' is not a funding plan — it's how pilots die quietly.",
    "Define success criteria with stakeholders, not for stakeholders. Unilateral criteria create a legitimacy gap at the go/no-go decision.",
    "Map who watches the demo versus who changes their daily work. If you've only engaged the first group, adoption will stall.",
  ],
  "delivery-scope-integrity": [
    "Document what is explicitly out of scope and what is deferred to a later phase. If you can't answer immediately, scope is already creeping.",
    "Set a hard end date for the pilot with a pre-agreed go/no-go decision process. Open-ended pilots become permanent experiments that never resolve into decisions.",
    "Audit every critical dependency: hiring, procurement, technology decisions. If any are unresolved, the pilot's timeline is fiction.",
  ],
};
