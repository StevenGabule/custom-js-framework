import { Dep } from './dep';
import { IDependent } from './types';

export class Watcher<T extends object, K extends keyof T> implements IDependent {
	private readonly vm: T;
	private readonly key: K;
	private readonly callback: (newValue: T[K], oldValue: T[K]) => void;
	private value: T[K];

	constructor(vm: T, key: K, callback: (newValue: T[K], oldValue: T[K]) => void) {
		this.vm = vm;
		this.key = key;
		this.callback = callback;
		this.value = this.get();
	}

	get(): T[K] {
		Dep.target = this;
		const value = this.vm[this.key];
		Dep.target  =null;
		return value;
	}

	update(): void {
		const newValue = this.get();
		const oldValue = this.value;
		if(newValue != oldValue) {
			this.value = newValue;
			this.callback.call(this.vm, newValue, oldValue);
		}
	}
}