import { Dep } from './dep';
import { IComputed } from './types';

export class Computed<T> implements IComputed<T> {
	private _dirty: boolean = true;
	private _value!: T;
	private readonly _dep: Dep = new Dep();
	private readonly _getter: () => T;
	private readonly _setter?: (value: T) => void;

	constructor(getter: () => T, setter?: (value: T) => void) {
		this._getter = getter;
		this._setter = setter;

		// Create getter/setter property
		Object.defineProperty(this, 'value', {
			get: this.getValue.bind(this),
			set: this.setValue.bind(this),
			enumerable: true,
			configurable: true
		})
	}

	private getValue() : T {
		if(this._dirty) {
			this._value = this._getter();
			this._dirty = false;
		}
		this._dep.depend();
		return this._value;
	}

	private setValue(newValue: T) : void {
		if(this._setter) {
			this._setter(newValue);
		} else {
			throw new Error('Computed property is read-only')
		}
	}

	markDirty(): void {
		if(!this._dirty) {
			this._dirty = true;
			this._dep.notify();
		}
	}

	get value(): T {
		return this.getValue();
	}

	set value(newValue: T) {
		this.setValue(newValue);
	}	
}