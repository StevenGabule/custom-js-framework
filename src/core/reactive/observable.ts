import { Dep } from './dep';

export class Observable<T extends object> {
	private readonly rawData: T;

	constructor(data: T) {
		this.rawData = data;
		this.makeReactive(data)
	}

	private makeReactive(obj: T): T {
		if(!obj || typeof obj !== 'object') {
			return obj;
		}

		if(Array.isArray(obj)) {
			this.wrapArray(obj);
		}

		return this.walk(obj);
	}

	private walk(obj: T): T {
		const keys = Object.keys(obj) as (keyof T)[];

		for(const key of keys) {
			let value = obj[key];
			const dep = new Dep();
			
      // Recursively make nested objects reactive
			if(typeof value === 'object' && value !== null) {
				value = new Observable(value as object) as T[typeof key];
			}

			Object.defineProperty(obj, key, {
				enumerable: true,
				configurable: true,
				get() {
					dep.depend();
					return value;
				},
				set(newValue: T[typeof key]) {
					if(value === newValue) {
						return;
					}
					value = typeof newValue === 'object' ? new Observable(newValue as object) as T[typeof key] : newValue;
					dep.notify();
				}
			});
		}
		return obj;
	}

	private wrapArray<U>(array: U[]): void {
		type CallableArrayMethod = keyof {
			[K in keyof Array<any> as Array<any>[K] extends (...args: any[]) => any ? K : never] : any;
		}
		
		const methodsToPatch: CallableArrayMethod[] = ['push','pop','shift', 'unshift','splice','sort','reverse'];
		methodsToPatch.forEach(method => {
			// Ensure `original` is treated as a callable function
			const original = array[method] as (...args: any[]) => any;
			const dep = new Dep();

			Object.defineProperty(array, method, {
				value: function(...args: any[]): any {
					const result = original.apply(this, args);
					dep.notify();
					return result;
				},
				enumerable: false,
				writable: true,
				configurable: true
			})
		})
	}
}