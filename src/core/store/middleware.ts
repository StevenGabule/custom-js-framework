import { Middleware } from "./types";

export const logger: Middleware<any> = (store) => (next) => (action) => {
  console.group(action.type);
  console.log("Previous state:", store.getState());
  console.log("Action:", action);

  next(action);

  console.log("Next state: ", store.getState());
  console.groupEnd();
};

export const thunk: Middleware<any> = (store) => (next) => (action) => {
  if (typeof action === "function") {
    // @ts-ignore
    return action(store.dispatch, store.getState);
  }
  return next(action);
};
