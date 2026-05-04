import { Agent, HarnessState, ActionSuggestion, ToolResult } from "../types/contracts.js";
import { ToolGateway } from "../tools/toolGateway.js";
import { StateStore } from "../state/stateStore.js";
import { ActionVerifier } from "../verifier/actionVerifier.js";
import { SelfHealer } from "../healing/selfHealer.js";
import { Logger } from "../observability/logger.js";

export class Orchestrator {
  private readonly store: StateStore;
  private readonly verifier = new ActionVerifier();
  private readonly healer: SelfHealer;

  constructor(
    initialState: HarnessState,
    private readonly agent: Agent,
    private readonly tools: ToolGateway,
    private readonly logger: Logger
  ) {
    this.store = new StateStore(initialState);
    this.healer = new SelfHealer(agent);
  }

  run(): HarnessState {
    while (!this.store.get().done && this.store.get().step < this.store.get().maxSteps) {
      const state = this.store.get();
      const action = this.agent.suggestNextAction(state);
      this.store.recordStep({ step: state.step, phase: "PLAN", action });
      this.logger.info("PLAN", { step: state.step, action });

      const result = this.execute(action);
      this.store.recordStep({ step: state.step, phase: "EXECUTE", action, result });
      const verification = this.verifier.verify(action, result);
      this.store.recordStep({ step: state.step, phase: "VERIFY", action, result, verification });

      if (result.dom) this.store.snapshotDom(result.dom);

      if (!verification.ok) {
        this.logger.warn("VERIFY_FAILED", { step: state.step, reason: verification.reason });
        const healed = this.tryHealing(action, result);
        if (!healed) break;
      } else {
        this.store.patch({ step: state.step + 1, retriesForCurrentStep: 0 });
        if (action.tool === "extract_text") this.store.patch({ done: true });
      }
    }
    this.store.recordStep({ step: this.store.get().step, phase: "DONE" });
    return this.store.get();
  }

  private execute(action: ActionSuggestion): ToolResult {
    switch (action.tool) {
      case "open_page": return this.tools.open_page(action.url!);
      case "click": return this.tools.click(action.selector!);
      case "type": return this.tools.type(action.selector!, action.text!);
      case "extract_text": return this.tools.extract_text(action.selector!);
      case "get_dom": return this.tools.get_dom();
    }
  }

  private tryHealing(action: ActionSuggestion, result: ToolResult): boolean {
    const state = this.store.get();
    if (!result.dom || state.retriesForCurrentStep >= state.maxRetriesPerStep) {
      this.store.patch({ done: true });
      return false;
    }
    const alternatives = this.healer.heal(action, result.dom);
    for (const candidate of alternatives) {
      this.logger.info("RETRY", { step: state.step, selector: candidate.selector });
      const retry = this.execute(candidate);
      const vr = this.verifier.verify(candidate, retry);
      this.store.recordStep({ step: state.step, phase: "RETRY", action: candidate, result: retry, verification: vr });
      if (vr.ok) {
        this.store.patch({ step: state.step + 1, retriesForCurrentStep: 0 });
        return true;
      }
    }
    this.store.recordFailure({ step: state.step, action, reason: "All healing retries failed", retries: alternatives.length, timestamp: new Date().toISOString() });
    this.store.patch({ retriesForCurrentStep: state.retriesForCurrentStep + 1, done: true });
    return false;
  }
}
