import { HMRRuntime, HotModule, ModuleMap } from "./types";

export class HotModuleReplacementRuntime implements HMRRuntime {
  public modules: ModuleMap = {};
  private acceptCallbacks: Map<string, (module: any) => void> = new Map();
  private declinedModules: Set<string> = new Set();
  private moduleDisposers: Map<string, () => void> = new Map();
  private lastHash: string | null = null;

  constructor() {
    this.setupWebSocketConnection();
  }

  private setupWebSocketConnection(): void {
    const socket = new WebSocket("ws://localhost:8080");
    socket.addEventListener("message", async (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "hash":
          this.lastHash = message.data;
          break;
        case "ok":
          if (this.lastHash !== message.hash) return;
          await this.applyUpdate(message.modules);
          break;
        case "error":
          console.log(`HMR update failed: ${message.error}`);
          break;
      }
    });
  }

  public accept(moduleId: string, callback: (module: any) => void): void {
    this.acceptCallbacks.set(moduleId, callback);
  }

  public decline(moduleId: string): void {
    this.declinedModules.add(moduleId);
  }

  public async apply(moduleUpdates: Record<string, any>): Promise<void> {
    try {
      await this.applyUpdate(moduleUpdates);
    } catch (error) {
      console.error(`Error applying HMR update: ${error}`);
      window.location.reload();
    }
  }

  private async applyUpdate(moduleUpdates: Record<string, any>): Promise<void> {
    const updatedModules = new Set<string>();
    const outdatedModules = new Set<string>();
    const queue = Object.keys(moduleUpdates);

    // first pass: Identify all modules that need updating
    while (queue.length > 0) {
      const moduleId = queue.shift()!;
      if (this.declinedModules.has(moduleId) || updatedModules.has(moduleId)) {
        continue;
      }

      updatedModules.add(moduleId);
      outdatedModules.add(moduleId);

      // add dependencies to queue
      const module = this.modules[moduleId];
      if (module?.dependencies) {
        queue.push(...module.dependencies);
      }
    }

    // Call dispose handlers
    for (const moduleId of outdatedModules) {
      const disposer = this.moduleDisposers.get(moduleId);
      if (disposer) {
        await disposer();
        this.moduleDisposers.delete(moduleId);
      }
    }

    // Update modules
    for (const moduleId of updatedModules) {
      if (moduleUpdates[moduleId]) {
        try {
          const oldModule = this.modules[moduleId];
          const newModule = moduleUpdates[moduleId];

          // Update module reference
          this.modules[moduleId] = newModule;

          // call accept handler if exists
          const acceptCallback = this.acceptCallbacks.get(moduleId);
          if (acceptCallback) {
            await acceptCallback(newModule);
          }

          // special handling for different module types
          await this.handleSpecialModules(oldModule, newModule);
        } catch (error) {
          console.error(`Error updating module ${moduleId}: ${error}`);
          return this.handleError(error);
        }
      }
    }

    this.removeOutdatedModules(outdatedModules);
  }

  private async handleSpecialModules(
    oldModule: HotModule,
    newModule: any
  ): Promise<void> {
    // handle reducers
    if (oldModule.reducers && newModule.reducers) {
      await this.updateReducers(oldModule.reducers, newModule.reducers);
    }

    // handle components
    if (oldModule.components && newModule.components) {
      await this.updateComponents(oldModule.components, newModule.components);
    }
  }

  private async updateReducers(
    oldReducers: Record<string, Function>,
    newReducers: Record<string, Function>
  ): Promise<void> {
    // Get store instance (assuming it's globally available)
    const store = (window as any).__STORE__;
    if (!store) return;

    // replace reducers
    for (const [key, reducer] of Object.entries(newReducers)) {
      store.replaceReducer(key, reducer);
    }
  }

  private async updateComponents(
    oldComponents: Record<string, any>,
    newComponents: Record<string, any>
  ): Promise<void> {
    for (const [name, component] of Object.entries(newComponents)) {
      const instances = this.findComponentInstance(name);
    }
  }

  private findComponentInstance(componentName: string): any[] {
    // Implementation depends on your component system
    // This is just a placeholder
    return [];
  }

  private async updateComponentInstance(
    instance: any,
    newComponent: any
  ): Promise<void> {
    if (instance.beforeHotUpdate) {
      await instance.beforeHotUpdate();
    }

    // Update prototype chain
    Object.setPrototypeOf(instance, newComponent.prototype);

    if (instance.afterHotUpdate) {
      await instance.afterHotUpdate();
    }

    // Trigger re-render
    if (instance.forceUpdate) {
      instance.forceUpdate();
    }
  }

  private removeOutdatedModules(outdatedModules: Set<string>): void {
    for (const moduleId of outdatedModules) {
      delete this.modules[moduleId];
      this.acceptCallbacks.delete(moduleId);
      this.declinedModules.delete(moduleId);
    }
  }

  private handleError(err: any): void {
    console.error("HMR update failed - full reload required");
    console.error(err);
    window.location.reload();
  }
}
