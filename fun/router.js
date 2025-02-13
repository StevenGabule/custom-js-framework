export class Router {
	constructor(rootElement) {
		this.routes = [];
		this.rootElement = rootElement;
		window.addEventListener('hashchange', () => this.routeChanged())
	}
	 /**
   * Register a route by path and associated component.
   */
	addRoute(path, component) {
		this.routes.push({path,component})
	}

	/**
   * When the URL hash changes, find the matching route.
   */
	routeChanged() {
		const hash = window.location.hash.slice(1) || '/';
		const route = this.routes.find(r => r.path === hash);
		if(route) {
			this.rootElement.innerHTML = '';
			const componentInstance = new route.component();
			if(componentInstance.onMount) componentInstance.onMount();
			this.rootElement.appendChild(createComponentDOM(componentInstance));
		}
	}

	init() {
		if(!window.location.hash) {
			window.location.hash = '/'
		}
		this.routeChanged();
	}
}

/** Helper: Render a component instance (using our renderer logic) */ 
function createComponentDOM(component) {
	const vnode = component.render();
	return createElement(vnode);
}

import { render as createElement } from './renderer';