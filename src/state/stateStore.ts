import { HarnessState, SimplifiedDOM, StepRecord, FailureLog } from "../types/contracts.js";

export class StateStore {
  constructor(private state: HarnessState) {}

  snapshotDom(dom: SimplifiedDOM): void { this.state.domSnapshots.push(structuredClone(dom)); }
  recordStep(record: StepRecord): void { this.state.history.push(record); }
  recordFailure(failure: FailureLog): void { this.state.failures.push(failure); }
  patch(partial: Partial<HarnessState>): void { this.state = { ...this.state, ...partial }; }
  get(): HarnessState { return this.state; }
}
