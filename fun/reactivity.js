const depMap = new WeakMap();
let activeEffect = null;

/**
 * Run a reactive effect. Any reactive reads during the execution
 * of `fn` will register with this effect.
 */
export function effect(fn) {
	activeEffect = fn;
	fn();
	activeEffect = null;
}

/** Track dependencies for a given target/key. */
function track(target, key) {
	if(!activeEffect) return;

	let depsMap = depMap.get(target);
	if(!depsMap) {
		depsMap = new Map();
		depMap.set(target, depsMap)
	}
	
	let deps = depsMap.get(key)
	if(!deps) {
		deps = new Set()
		depsMap.set(key, deps)
	}
	
	deps.add(activeEffect)
}

/** Trigger all effects that depend on target/key. */
function trigger(target, key) {
	const depsMap = depMap(target)
	if(!depsMap) return;
	const deps = depsMap.get(key);
	if(deps) {
		deps.forEach(effect => effect())
	}
}

export function reactive(target)  {
	return new Proxy(target, {
		get(obj, key, receiver) {
			const result = Reflect.get(obj, key, receiver)
			track(obj, key);
			return result;
		},
		set(obj, key, value, receiver) {
			const result = Reflect.set(obj, key, value, receiver);
			trigger(obj, key)
			return result;
		}
	})
}


// USAGE EXAMPLE:
// import {reactive, effect} from './reactivity';
const state = reactive({count: 0});
effect(() => {
	console.log(`Count is: ${state.count}`)
}) 
state.count++;

