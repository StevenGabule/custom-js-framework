import {
  Action,
  Middleware,
  Reducer,
  StoreOptions,
  Subscription,
} from "./types";

export class Store<S> {
  private state: S;
  private reducers: { [key: string]: Reducer<S> };
  private subscribers: Set<Subscription<S>>;
  private middleware: Middleware<S>[];
  private isDispatching: boolean;

  constructor(options: StoreOptions<S>) {
    this.state = options.initialState;
    this.reducers = options.reducers;
    this.subscribers = new Set();
    this.middleware = options.middleware || [];
    this.isDispatching = false;
  }

  public getState(): Readonly<S> {
    if (this.isDispatching) {
      throw new Error(`Cannot get state while dispatching.`);
    }
    return Object.freeze({ ...this.state });
  }

  public dispatch(action: Action): void {
    if (this.isDispatching) {
      throw new Error("Cannot dispatch action while dispatching");
    }
    try {
      this.isDispatching = true;

      // apply middleware
      const chain = this.middleware.map((middleware) => middleware(this));
      const dispatch = chain.reduceRight(
        (next, middleware) => (action: Action) => middleware(next)(action),
        this.baseDispatch.bind(this)
      );
      dispatch(action);
    } finally {
      this.isDispatching = false;
    }
  }

  private baseDispatch(action: Action): void {
    const reducer = this.reducers[action.type];
    if (!reducer) {
      console.log(`No reducer found for action type: ${action.type}`);
      return;
    }

    const nextState = reducer(this.state, action);
    if (nextState !== this.state) {
      this.state = nextState;
      this.notify();
    }
  }

  public subscribe(subscription: Subscription<S>): () => void {
    this.subscribers.add(subscription);
    return () => this.subscribers.delete(subscription);
  }

  private notify(): void {
    for (const subscriber of this.subscribers) {
      subscriber(this.state);
    }
  }
}
