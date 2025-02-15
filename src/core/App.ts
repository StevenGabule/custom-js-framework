import { AppOptions, Plugin } from "..";
import { Component } from "./component/component";
import { ComponentInspector } from "./devtools/component-inspector";
import { DebugPanel } from "./devtools/debug-panel";
import { EventLogger } from "./devtools/event-logger";
import { PerformanceMonitor } from "./devtools/performance";
import { StateTracker } from "./devtools/state-tracker";
import { HotModuleReplacementRuntime } from "./hmr/runtime";
import { Renderer } from "./jsx/renderer";
import { Router } from "./router/router";
import { Store } from "./store/store";
import { createElement } from "./jsx/runtime";
import { BaseComponent } from "./component/base-component";
import { ComponentProps } from "./component/types";

export class Application {
  private name: string;
  private router!: Router;
  private store!: Store<any>;
  private renderer!: Renderer;
  private rootComponent: Component | null = null;
  private plugins: Map<string, Plugin> = new Map();
  private devtools: any;
  private hmr: HotModuleReplacementRuntime | null = null;

  constructor(options: AppOptions = {}) {
    this.name = options.name || "App";
    this.initializeFramework(options);
  }

  private initializeFramework(options: AppOptions): void {
    if (options.store) {
      this.store = new Store(options.store);
      (window as any).__STORE__ = this.store;
    }

    // Initialize Router
    if (options.routes) {
      this.router = new Router({
        routes: options.routes,
        // @ts-ignore
        mode: "history",
      });
    }

    // Initialize Renderer
    this.renderer = new Renderer();

    if (options.devtools && process.env.NODE_ENV === "development") {
      this.initializeDevTools();
    }

    // Initialize HMR
    if (process.env.NODE_ENV === "development") {
      this.hmr = new HotModuleReplacementRuntime();
      (window as any).__HMR__ = this.hmr;
    }

    // Register Components
    if (options.components) {
      this.registerComponents(options.components);
    }

    // Install Plugins
    if (options.plugins) {
      this.installPlugins(options.plugins);
    }
  }

  private initializeDevTools(): void {
    this.devtools = {
      performanceMonitor: new PerformanceMonitor(),
      componentInspector: new ComponentInspector(),
      stateTracker: new StateTracker(),
      eventLogger: new EventLogger(),
      debugPanel: new DebugPanel(),
    };
    (window as any).__DEVTOOLS__ = this.devtools;
  }

  private registerComponents(
    components: Record<string, typeof Component>
  ): void {
    for (const [name, component] of Object.entries(components)) {
      if (this.hmr) {
        this.hmr.accept(
          `components/${name}`,
          (updatedComponent: typeof Component) => {
            this.updateComponent(name, updatedComponent);
          }
        );
      }
    }
  }

  private installPlugins(plugins: Plugin[]): void {
    for (const plugin of plugins) {
      if (this.plugins.has(plugin.name)) {
        console.warn(`Plugin "${plugin.name}" is already installed.`);
        continue;
      }

      plugin.install(this);
      this.plugins.set(plugin.name, plugin);
    }
  }

  private async updateComponentInstances(
    component: Component,
    targetName: string,
    updatedComponent: typeof Component
  ): Promise<void> {
    if (component.constructor.name === targetName) {
      // Save state and props before update
      // @ts-ignore
      const currentState = { ...component.state };

      // @ts-ignore
      const currentProps = { ...component.props };

      // Update the component's prototype
      Object.setPrototypeOf(component, updatedComponent.prototype);

      // Restore state and props
      // @ts-ignore
      component.state = currentState;
      // @ts-ignore
      component.props = currentProps;

      // Trigger re-render
      await component.forceUpdate();
    }

    // Update child components
    const children = component.getChildren();
    await Promise.all(
      children.map((child) =>
        this.updateComponentInstances(child, targetName, updatedComponent)
      )
    );
  }

  public mount(
    RootComponentClass: new (props: ComponentProps) => BaseComponent,
    container: string | Element
  ): void {
    const targetContainer =
      typeof container === "string"
        ? document.querySelector(container)
        : container;

    if (!targetContainer) {
      throw new Error(`Container ${container} not found`);
    }

    // Create root component instance with router
    // @ts-ignore
    this.rootComponent = new RootComponentClass({
      router: this.router,
      store: this.store,
    });

    // Mount the component
    // @ts-ignore
    this.rootComponent.mount(targetContainer);
  }

  private updateComponent(
    name: string,
    updatedComponent: typeof Component
  ): void {
    if (this.rootComponent) {
      this.updateComponentInstances(this.rootComponent, name, updatedComponent);
    }
  }

  public use(plugin: Plugin): this {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin "${plugin.name}" is already installed.`);
      return this;
    }

    plugin.install(this);
    this.plugins.set(plugin.name, plugin);
    return this;
  }
}
