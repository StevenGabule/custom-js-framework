import { reactive } from './reactivity';
export class Store {
	constructor(initialState) {
    // The state is wrapped in our reactive proxy.
		this.state = reactive(initialState);
	}

	/**
   * Synchronously modify the state using a mutation function.
   */
	commit(mutation, payload) {
		mutation(this.state, payload);
	}

	/**
   * Dispatch an action, possibly asynchronous.
   */
	dispatch(action, payload) {
		return action({state: this.state, commit: this.commit.bind(this)}, payload);
	}
}

// Usage Example:
// const store = new Store({ count: 0 });
// store.commit((state, payload) => { state.count += payload; }, 1);