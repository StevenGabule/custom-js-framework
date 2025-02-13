import { Computed } from './computed';
import { Observable } from './observable';
import { Ref } from './ref';

interface ReactiveState<T extends object>  {
	state: T;
	createRef: <U>(value: U) => Ref<U>;
	computed: <U>(getter: () => U, setter?: (value: U) => void) => Computed<U>;
}

export const createReactiveState = <T extends object>(initialState: T) : ReactiveState<T> => {
	const state = new Observable(initialState)
	const refs : Record<PropertyKey, Ref<any>>  = {};

	const createRef = <U>(value: U): Ref<U> => {
		const ref = new Ref(value);
		const key = Symbol();
		refs[key] = ref;
		return ref;
	};

	const computed = <U>(getter: () => U, setter?: (value: U) => void): Computed<U> => {
		return new Computed(getter, setter);
	}
	
	// @ts-ignore
	return { state,  createRef,  computed }
}