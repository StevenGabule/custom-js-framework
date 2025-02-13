export type Primitive = string | number | boolean | symbol | null | undefined;
export type PropertyKey = string | symbol;

export interface IDependent {
	update() : void
}

export interface IComputed<T> {
	value: T;
	markDirty(): void;
}

export interface IRef<T> {
	value: T
}