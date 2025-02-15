import { Action, Reducer } from "./types";

export function combineReducer<S>(reducers: {
  [K in keyof S]: Reducer<S[K]>;
}): Reducer<S> {
  return (state: S, action: Action): S => {
    const nextState: Partial<S> = {};
    let hasChanged = false;

    for (const key in reducers) {
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    return hasChanged ? (nextState as S) : state;
  };
}
