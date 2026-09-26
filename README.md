# AI Self-Healing UI Test Harness

A TypeScript harness for self-healing UI test automation. When a test step fails because a selector or page element has changed, the harness attempts to recover automatically instead of failing outright.

## Layout

```text
src/
  agent/           Rule-based decision-making for the harness
  harness/          Orchestrates test execution
  healing/          Self-healing logic that recovers from failed steps
  verifier/         Deterministic checks that confirm expected outcomes
  tools/            Browser driver and tool gateway used to interact with the page
  state/            Runtime state tracking across a test run
  observability/    Logging
  types/            Shared contracts and type definitions
  tests/            Example test: login flow
  index.ts          Main entry point
```

## Getting Started

```bash
npm install
npm run build
npm start
```

## Running the Example Test

```bash
npm run test:login
```

This runs the login flow test in `src/tests/loginFlowTest.ts`, exercising the agent, harness, and healing modules together.
