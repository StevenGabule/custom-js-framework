import { createReactiveState } from "../reactive";
import { Ref } from "../reactive/ref";
import { ComponentStatus } from "./enums";
import { ComponentError } from "./errors";
import {
  ComponentProps,
  ComponentState,
  ComponentUpdateCallback,
  LifecycleHooks,
} from "./types";

export abstract class Component implements LifecycleHooks {
  public beforeCreate?(): void;
  public created?(): void;
  public beforeMount?(): void;
  public mounted?(): void;
  public beforeUpdate?(): void;
  public updated?(): void;
  public beforeUnmount?(): void;
  public unmounted?(): void;
  public errorCaptured?(err: Error, component: Component): boolean | void;
  private _status: ComponentStatus = ComponentStatus.CREATED;
  private _isMounted: boolean = false;
  private _isUpdating: boolean = false;
  private _updateQueue: Set<ComponentUpdateCallback> = new Set();
  private _container: Element | null = null;
  private _children: Set<Component> = new Set();
  private _parent: Component | null = null;

  protected props: Readonly<ComponentProps>;
  protected state: ComponentState;
  protected refs: { [key: string]: Ref<any> } = {};

  constructor(props: ComponentProps = {}) {
    this.props = Object.freeze({ ...props });
    this.state = createReactiveState({}).state;

    this._initializeComponent();
  }

  private _initializeComponent(): void {
    try {
      this.beforeCreate?.();
      this._setupReactiveState();
      this.created?.();
    } catch (error) {
      this._handleError(error as Error);
    }
  }

  private _setupReactiveState(): void {
    const { state, createRef } = createReactiveState(this.getInitialsState());
    this.state = state;

    // setup refs
    const initialRefs = this.getInitialRefs();
    for (const [key, value] of Object.entries(initialRefs)) {
      this.refs[key] = createRef(value);
    }
  }

  protected getInitialsState(): ComponentState {
    return {};
  }

  protected getInitialRefs(): { [key: string]: any } {
    return {};
  }

  private async _handleError(error: Error): Promise<void> {
    try {
      // Check if current component has error handler
      if (this.errorCaptured) {
        const shouldPropagate = this.errorCaptured(error, this);
        if (shouldPropagate === false) return; // Error was handled, don't propagate
      }

      // Propagate to parent if exists
      if (this._parent?.errorCaptured) {
        const shouldPropagate = this._parent.errorCaptured(error, this);
        if (shouldPropagate === false) {
          return; // Parent handled the error
        }
      }
      throw error;
    } catch (e) {
      // Ensure we don't swallow errors from error handlers themselves
      if (e !== error) {
        console.error("Error in error handler:", e);
      }
      throw error;
    }
  }

  protected setState(newState: Partial<ComponentState>): void {
    if (!this._isMounted) {
      throw new ComponentError("Cannot call setState on unmounted component.");
    }
    const updateCallback = () => {
      Object.assign(this.state, newState);
      this._queueUpdate();
    };
    this._updateQueue.add(updateCallback);
    queueMicrotask(() => this._processUpdateQueue());
  }

  private _queueUpdate(): void {
    if (!this._isUpdating) {
      this._isUpdating = true;
      queueMicrotask(() => this._update());
    }
  }

  private async _processUpdateQueue(): Promise<void> {
    if (this._updateQueue.size === 0) return;

    const callbacks = Array.from(this._updateQueue);
    this._updateQueue.clear();

    for (const callback of callbacks) {
      try {
        await callback();
      } catch (error) {
        await this._handleError(error as Error);
      }
    }
  }

  private async _update(): Promise<void> {
    if (!this._isMounted) return;

    try {
      await this.beforeUpdate?.();
      await this._render();
      await this.updated?.();
    } catch (error) {
      await this._handleError(error as Error);
    } finally {
      this._isUpdating = false;
    }
  }

  protected abstract render(): Promise<Element> | Element;

  private async _render(): Promise<void> {
    if (!this._container) return;

    const newElement = await this.render();
    this._container.innerHTML = "";
    this._container.appendChild(newElement);
  }

  public async mount(container: Element | string): Promise<void> {
    const targetContainer =
      typeof container === "string"
        ? document.querySelector(container)
        : container;

    if (!targetContainer) {
      throw new ComponentError("Invalid container element");
    }

    try {
      await this.beforeMount?.();
      this._container = targetContainer;
      this._isMounted = true;
      this._status = ComponentStatus.MOUNTED;
      await this._render();
      await this.mounted?.();
    } catch (error) {
      await this._handleError(error as Error);
    }
  }

  public async unmount(): Promise<void> {
    if (!this._isMounted) return;

    try {
      await this.beforeUnmount?.();

      // unmount all children first
      for (const child of this._children) {
        await child.unmount();
      }
      this._children.clear();

      // clean up this component
      if (this._container) {
        this._container.innerHTML = "";
      }

      this._isMounted = false;
      this._container = null;
      this._status = ComponentStatus.UNMOUNTED;

      await this.unmount?.();
    } catch (error) {
      await this._handleError(error as Error);
    }
  }

  protected addChild(child: Component): void {
    this._children.add(child);
    child._parent = this;
  }

  protected removeChild(child: Component): void {
    this._children.delete(child);
    child._parent = null;
  }

  public get status(): ComponentStatus {
    return this._status;
  }

  public get isMounted(): boolean {
    return this._isMounted;
  }
}
