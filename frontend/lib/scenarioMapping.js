// Best-effort heuristic linking a call script's dynamic scenarios (a fixed
// 6-key taxonomy, generated independently of the script sections) to the
// section they're most relevant to, keyed off section heading keywords.
// No backend field exists for this today — see plan §6.
const KEYWORDS = {
  already_has_product: /need|discover|understand|requirement|present|pitch|current/i,
  competitor_offer: /need|discover|understand|requirement|present|pitch|compet/i,
  price_objection: /price|rate|cost|fee|charge|objection|benefit|value/i,
  trust_concern: /rapport|open|welcome|trust|intro/i,
  not_interested: /close|cta|action|next|decision|objection/i,
  needs_time: /close|cta|action|next|decision|objection/i,
};

export function mapScenariosToSections(sections = [], scenarios = []) {
  const bySection = new Map();
  const unmatched = [];

  for (const scenario of scenarios) {
    const pattern = KEYWORDS[scenario.scenario_key];
    let matchedIndex = -1;
    if (pattern) {
      matchedIndex = sections.findIndex((s) => pattern.test(s.heading || ""));
    }
    if (matchedIndex >= 0) {
      const list = bySection.get(matchedIndex) || [];
      list.push(scenario);
      bySection.set(matchedIndex, list);
    } else {
      unmatched.push(scenario);
    }
  }

  return { bySection, unmatched };
}
