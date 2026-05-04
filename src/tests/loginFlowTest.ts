import { RuleBasedAgent } from "../agent/ruleBasedAgent.js";
import { Orchestrator } from "../harness/orchestrator.js";
import { Logger } from "../observability/logger.js";
import { BrowserDriver } from "../tools/browserDriver.js";
import { ToolGateway } from "../tools/toolGateway.js";
import { HarnessState } from "../types/contracts.js";

const pages = {
  "https://app.local/login": {
    url: "https://app.local/login",
    dom: {
      page: "login",
      root: {
        tag: "main",
        attrs: { id: "root" },
        children: [
          { tag: "h1", text: "Login", attrs: {}, children: [] },
          { tag: "input", attrs: { name: "username", type: "text", value: "" }, children: [] },
          { tag: "input", attrs: { name: "password", type: "password", value: "" }, children: [] },
          { tag: "button", text: "Log In", attrs: { "data-testid": "login-submit" }, children: [] }
        ]
      }
    }
  }
};

const initial: HarnessState = {
  goal: "Complete login flow with verification",
  step: 0,
  maxSteps: 10,
  maxRetriesPerStep: 3,
  retriesForCurrentStep: 0,
  domSnapshots: [],
  history: [],
  failures: [],
  done: false
};

const harness = new Orchestrator(initial, new RuleBasedAgent(), new ToolGateway(new BrowserDriver(pages)), new Logger());
const result = harness.run();
console.log("FINAL_STATE", JSON.stringify({ done: result.done, steps: result.step, failures: result.failures.length }, null, 2));
