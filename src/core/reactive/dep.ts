import { IDependent } from './types';

export class Dep {
	private subscribers: Set<IDependent>;
	static target: IDependent | null = null;

	constructor() {
		this.subscribers = new Set();
	}

	depend(): void {
		if(Dep.target) {
			this.subscribers.add(Dep.target);
		}
	}

	notify(): void {
		for(const subscriber of this.subscribers) {
			subscriber.update();
		}
	}
}