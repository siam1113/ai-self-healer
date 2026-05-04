export type ToolName = "open_page" | "click" | "type" | "extract_text" | "get_dom";

export interface ActionSuggestion {
  tool: ToolName;
  selector?: string;
  text?: string;
  url?: string;
  expectation?: string;
  reason: string;
}

export interface ToolResult {
  ok: boolean;
  tool: ToolName;
  selector?: string;
  value?: string;
  error?: string;
  dom?: SimplifiedDOM;
}

export interface DomElement {
  tag: string;
  text?: string;
  attrs: Record<string, string>;
  children: DomElement[];
}

export interface SimplifiedDOM {
  page: string;
  root: DomElement;
}

export interface FailureLog {
  step: number;
  action: ActionSuggestion;
  reason: string;
  retries: number;
  timestamp: string;
}

export interface StepRecord {
  step: number;
  phase: "PLAN" | "EXECUTE" | "VERIFY" | "RETRY" | "DONE";
  action?: ActionSuggestion;
  result?: ToolResult;
  verification?: VerificationResult;
}

export interface VerificationResult {
  ok: boolean;
  reason: string;
  expectedStateMet: boolean;
}

export interface HarnessState {
  goal: string;
  step: number;
  maxSteps: number;
  maxRetriesPerStep: number;
  retriesForCurrentStep: number;
  currentUrl?: string;
  domSnapshots: SimplifiedDOM[];
  history: StepRecord[];
  failures: FailureLog[];
  done: boolean;
}

export interface Agent {
  suggestNextAction(state: HarnessState): ActionSuggestion;
  suggestAlternativeSelectors(failedSelector: string, dom: SimplifiedDOM): string[];
}
