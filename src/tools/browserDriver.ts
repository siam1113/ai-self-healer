import { SimplifiedDOM, ToolResult } from "../types/contracts.js";

interface PageModel {
  url: string;
  dom: SimplifiedDOM;
}

export class BrowserDriver {
  private current?: PageModel;

  constructor(private readonly pages: Record<string, PageModel>) {}

  openPage(url: string): ToolResult {
    const page = this.pages[url];
    if (!page) return { ok: false, tool: "open_page", error: `Unknown URL: ${url}` };
    this.current = structuredClone(page);
    return { ok: true, tool: "open_page", dom: this.current.dom };
  }

  click(selector: string): ToolResult {
    if (!this.current) return { ok: false, tool: "click", selector, error: "No page is open" };
    const node = findBySelector(this.current.dom.root, selector);
    if (!node) return { ok: false, tool: "click", selector, error: `Element not found: ${selector}` };

    if (selector === "button[data-testid='login-submit']") {
      const username = findBySelector(this.current.dom.root, "input[name='username']")?.attrs.value;
      const password = findBySelector(this.current.dom.root, "input[name='password']")?.attrs.value;
      if (username === "demo" && password === "s3cr3t") {
        this.current.dom.root.children.push({ tag: "div", text: "Welcome back", attrs: { role: "status" }, children: [] });
      } else {
        this.current.dom.root.children.push({ tag: "div", text: "Invalid credentials", attrs: { role: "alert" }, children: [] });
      }
    }

    return { ok: true, tool: "click", selector, dom: this.current.dom };
  }

  type(selector: string, text: string): ToolResult {
    if (!this.current) return { ok: false, tool: "type", selector, error: "No page is open" };
    const node = findBySelector(this.current.dom.root, selector);
    if (!node) return { ok: false, tool: "type", selector, error: `Element not found: ${selector}` };
    node.attrs.value = text;
    return { ok: true, tool: "type", selector, value: text, dom: this.current.dom };
  }

  extractText(selector: string): ToolResult {
    if (!this.current) return { ok: false, tool: "extract_text", selector, error: "No page is open" };
    const node = findBySelector(this.current.dom.root, selector);
    if (!node) return { ok: false, tool: "extract_text", selector, error: `Element not found: ${selector}` };
    return { ok: true, tool: "extract_text", selector, value: node.text ?? "", dom: this.current.dom };
  }

  getDom(): ToolResult {
    if (!this.current) return { ok: false, tool: "get_dom", error: "No page is open" };
    return { ok: true, tool: "get_dom", dom: this.current.dom };
  }
}

function findBySelector(root: any, selector: string): any {
  const matches = (n: any) => {
    if (selector.startsWith("#")) return n.attrs.id === selector.slice(1);
    const testId = selector.match(/\[data-testid='([^']+)'\]/)?.[1];
    if (testId) return n.attrs["data-testid"] === testId;
    const name = selector.match(/\[name='([^']+)'\]/)?.[1];
    if (name) return n.attrs.name === name;
    const role = selector.match(/\[role='([^']+)'\]/)?.[1];
    if (role) return n.attrs.role === role;
    return n.tag === selector;
  };
  const stack = [root];
  while (stack.length) {
    const n = stack.pop();
    if (!n) continue;
    if (matches(n)) return n;
    for (const c of n.children ?? []) stack.push(c);
  }
  return undefined;
}
