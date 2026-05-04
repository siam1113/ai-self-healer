import { Agent, ActionSuggestion, SimplifiedDOM } from "../types/contracts.js";

export class SelfHealer {
  constructor(private readonly agent: Agent) {}

  heal(action: ActionSuggestion, dom: SimplifiedDOM): ActionSuggestion[] {
    if (!action.selector) return [];
    const alternatives = this.agent.suggestAlternativeSelectors(action.selector, dom);
    return alternatives.map((selector) => ({ ...action, selector, reason: `Healing attempt via ${selector}` }));
  }
}
