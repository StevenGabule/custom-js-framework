import { ComponentProps, ComponentState } from "./types";

export abstract class Component {
  protected props: ComponentProps;
  protected state: ComponentState;
  private _children: Set<Component> = new Set();
  private _parent: Component | null = null;
  private _isUpdating: boolean = false;
  private _container: Element | null = null;

  constructor(props: ComponentProps = {}) {
    this.props = props;
    this.state = {};
  }

  // Child management
  public addChild(child: Component): void {
    this._children.add(child);
    child._parent = this;
  }

  public removeChild(child: Component): void {
    this._children.delete(child);
    child._parent = null;
  }

  public getChildren(): Component[] {
    return Array.from(this._children);
  }

  public getParent(): Component | null {
    return this._parent;
  }

  // Lifecycle methods
  public beforeCreate?(): void;
  public created?(): void;
  public beforeMount?(): void;
  public mounted?(): void;
  public beforeUpdate?(): void;
  public updated?(): void;
  public beforeUnmount?(): void;
  public unmounted?(): void;

  // State management
  protected setState(newState: Partial<ComponentState>): void {
    this.state = { ...this.state, ...newState };
    this.forceUpdate();
  }

  // Update methods
  public async forceUpdate(): Promise<void> {
    if (this._isUpdating) return;

    try {
      this._isUpdating = true;
      await this.beforeUpdate?.();
      await this._render();
      await this.updated?.();
    } finally {
      this._isUpdating = false;
    }
  }

  private async _render(): Promise<void> {
    if (this._container) {
      const element = await this.render();
      this._container.innerHTML = "";
      this._container.appendChild(element);
    }
  }

  public mount(container: Element): void {
    this._container = container;
    this.beforeMount?.();
    const element = this.render();
    // @ts-ignore
    container.appendChild(element);
    this.mounted?.();
  }

  public unmount(): void {
    this.beforeUnmount?.();
    if (this._container) {
      this._container.innerHTML = "";
      this._container = null;
    }
    this.unmounted?.();
  }

  protected abstract render(): Element | Promise<Element>;
}
