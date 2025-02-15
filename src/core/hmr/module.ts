import { HMRRuntime } from "./types";

export class HotModule {
  private runtime: HMRRuntime;
  private moduleId: string;

  constructor(moduleId: string, runtime: HMRRuntime) {
    this.moduleId = moduleId;
    this.runtime = runtime;
  }

  public accept(callback: (module: any) => void): void {
    this.runtime.accept(this.moduleId, callback);
  }

  public decline(): void {
    this.runtime.decline(this.moduleId);
  }
}
