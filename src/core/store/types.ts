import { Store } from "./store";

export type ActionType = string;

export interface Action<T = any> {
  type: ActionType;
  payload?: T;
}

export type Reducer<S, A extends Action = Action> = (state: S, action: A) => S;

export type Selector<S, R> = (state: S) => R;

export type ActionCreator<P = void, A extends Action = Action> = P extends void
  ? () => A
  : (payload: P) => A & { payload: P };

export type Middleware<S> = (
  store: Store<S>
) => (next: (action: Action) => void) => (action: Action) => void;

export type Subscription<S> = (state: S) => void;

export interface StoreOptions<S> {
  initialState: S;
  reducers: { [key: string]: Reducer<S> };
  middleware?: Middleware<S>[];
}
