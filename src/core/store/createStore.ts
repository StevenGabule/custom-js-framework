import { Store } from "./store";
import { StoreOptions } from "./types";

export function createStore<S>(options: StoreOptions<S>): Store<S> {
  return new Store(options);
}
