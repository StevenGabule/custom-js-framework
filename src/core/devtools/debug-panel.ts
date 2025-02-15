import { ComponentInspector } from "./component-inspector";
import { EventLogger } from "./event-logger";
import { PerformanceMonitor } from "./performance";
import { StateTracker } from "./state-tracker";
import {
  PerformanceMetric,
  ComponentTreeNode,
  StateUpdate,
  EventLog,
} from "./types";

export class DebugPanel {
  private container: HTMLElement;
  private performanceMonitor: PerformanceMonitor;
  private componentInspector: ComponentInspector;
  private stateTracker: StateTracker;
  private eventLogger: EventLogger;

  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
    this.componentInspector = new ComponentInspector();
    this.stateTracker = new StateTracker();
    this.eventLogger = new EventLogger();

    this.container = this.createContainer();
    this.initializeSubscriptions();
  }

  private createContainer(): HTMLElement {
    const container = document.createElement("div");
    container.id = "debug-panel";
    container.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 0;
      width: 300px;
      height: 400px;
      background: #fff;
      border: 1px solid #ccc;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;
    document.body.appendChild(container);
    return container;
  }

  private initializeSubscriptions(): void {
    this.performanceMonitor.subscribe(this.updatePerformanceView.bind(this));
    this.componentInspector.subscribe(this.updateComponentView.bind(this));
    this.stateTracker.subscribe(this.updateStateView.bind(this));
    this.eventLogger.subscribe(this.updateEventView.bind(this));
  }

  private updatePerformanceView(metric: PerformanceMetric): void {
    // Update performance tab
    console.log("Performance metric:", metric);
  }

  private updateComponentView(tree: ComponentTreeNode): void {
    // Update component tree view
    console.log("Component tree:", tree);
  }

  private updateStateView(update: StateUpdate): void {
    // Update state history view
    console.log("State update:", update);
  }

  private updateEventView(event: EventLog): void {
    // Update event log view
    console.log("Event:", event);
  }
}
