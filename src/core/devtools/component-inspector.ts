import { ComponentTreeNode } from "./types";

export class ComponentInspector {
  private componentTree: ComponentTreeNode | null = null;
  private selectedComponent: string | null = null;
  private subscribers: Set<(tree: ComponentTreeNode) => void> = new Set();

  public updateTree(rootComponent: any): void {
    this.componentTree = this.buildComponentTree(rootComponent);
    this.notifySubscribers();
  }

  private buildComponentTree(
    component: any,
    parentId: string = "root"
  ): ComponentTreeNode {
    const id = `${parentId}-${component.constructor.name}-${Date.now()}`;

    return {
      name: component.constructor.name,
      id,
      children: this.getComponentChildren(component).map((child) =>
        this.buildComponentTree(child, id)
      ),
      props: this.getComponentProps(component),
      state: this.getComponentState(component),
      metrics: [],
    };
  }

  private getComponentChildren(component: any): any[] {
    // Implementation depends on your component system
    return component.children || [];
  }

  private getComponentProps(component: any): Record<string, any> {
    return { ...component.props };
  }

  private getComponentState(component: any): Record<string, any> {
    return { ...component.state };
  }

  public selectComponent(componentId: string): void {
    this.selectedComponent = componentId;
    this.notifySubscribers();
  }

  public subscribe(callback: (tree: ComponentTreeNode) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    if (this.componentTree) {
      this.subscribers.forEach((callback) => callback(this.componentTree!));
    }
  }
}
