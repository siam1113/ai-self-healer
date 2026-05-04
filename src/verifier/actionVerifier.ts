import { ActionSuggestion, ToolResult, VerificationResult } from "../types/contracts.js";

export class ActionVerifier {
  verify(action: ActionSuggestion, result: ToolResult): VerificationResult {
    if (!result.ok) return { ok: false, reason: result.error ?? "Tool failed", expectedStateMet: false };
    if (["click", "type", "extract_text"].includes(action.tool) && action.selector && !result.dom) {
      return { ok: false, reason: "Missing post-action DOM", expectedStateMet: false };
    }
    if (action.tool === "extract_text" && action.expectation && result.value !== action.expectation) {
      return { ok: false, reason: `Expected '${action.expectation}', got '${result.value}'`, expectedStateMet: false };
    }
    return { ok: true, reason: "Action and expected state validated", expectedStateMet: true };
  }
}
