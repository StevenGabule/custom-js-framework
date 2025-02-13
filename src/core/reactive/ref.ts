import { Dep } from './dep';
import { IRef } from './types';

export class Ref<T> implements IRef<T> {
	private _value: T;
	private readonly _dep: Dep;

	constructor(value: T) {
		this._value = value;
		this._dep = new Dep();
	}

	get value(): T {
		this._dep.depend();
		return this._value;
	}

	set value(newValue: T) {
		if(this._value === newValue) {
			return;
		}
		this._value = newValue;
		this._dep.notify();
	}
}