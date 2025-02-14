import { Component } from './component';

export interface ComponentProps {
	[key: string] : any;
}

export interface ComponentState {
	[key: string]: any;
}

export type ComponentUpdateCallback = () => void;

export interface LifecycleHooks {
	beforeCreate?: () => void;
	created?: () => void;
	beforeMount?: () => void;
	mounted?: () => void;
	beforeUpdate?: () => void;
	updated?: () => void;
	beforeUnmount?: () => void;
	unmounted?: () => void;
	errorCaptured?: (err: Error, component: Component) => boolean | void;
}