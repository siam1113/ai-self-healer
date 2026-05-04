import { Agent, ActionSuggestion, HarnessState, SimplifiedDOM } from "../types/contracts.js";

export class RuleBasedAgent implements Agent {
  suggestNextAction(state: HarnessState): ActionSuggestion {
    const sequence: ActionSuggestion[] = [
      { tool: "open_page", url: "https://app.local/login", reason: "Open login page" },
      { tool: "type", selector: "input[name='username']", text: "demo", reason: "Enter username" },
      { tool: "type", selector: "input[name='password']", text: "s3cr3t", reason: "Enter password" },
      { tool: "click", selector: "button[data-testid='submit-login']", reason: "Submit form (intentionally brittle selector)" },
      { tool: "extract_text", selector: "div[role='status']", expectation: "Welcome back", reason: "Verify success message" }
    ];
    return sequence[Math.min(state.step, sequence.length - 1)];
  }

  suggestAlternativeSelectors(failedSelector: string, dom: SimplifiedDOM): string[] {
    const candidates = new Set<string>();
    walk(dom.root, (node, path) => {
      if (node.text?.toLowerCase().includes("login")) candidates.add(`${node.tag}${attrSel(node.attrs, "data-testid")}`);
      if (node.attrs["data-testid"]) candidates.add(`${node.tag}[data-testid='${node.attrs["data-testid"]}']`);
      if (node.attrs.name) candidates.add(`${node.tag}[name='${node.attrs.name}']`);
      if (path.length > 1) candidates.add(path.map((p) => p.tag).join(" > "));
    });
    candidates.delete(failedSelector);
    return Array.from(candidates).filter((s) => s.includes("login") || s.includes("submit") || s.includes("testid")).slice(0, 3);
  }
}

function walk(node: any, cb: (node: any, path: any[]) => void, path: any[] = []): void {
  const p = [...path, node];
  cb(node, p);
  for (const child of node.children ?? []) walk(child, cb, p);
}

function attrSel(attrs: Record<string, string>, key: string): string {
  return attrs[key] ? `[${key}='${attrs[key]}']` : "";
}
