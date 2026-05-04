import { BrowserDriver } from "./browserDriver.js";
import { ToolResult } from "../types/contracts.js";

export class ToolGateway {
  constructor(private readonly browser: BrowserDriver) {}

  open_page(url: string): ToolResult {
    return this.browser.openPage(url);
  }

  click(selector: string): ToolResult {
    return this.browser.click(selector);
  }

  type(selector: string, text: string): ToolResult {
    return this.browser.type(selector, text);
  }

  extract_text(selector: string): ToolResult {
    return this.browser.extractText(selector);
  }

  get_dom(): ToolResult {
    return this.browser.getDom();
  }
}
