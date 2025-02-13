import {Component} from './Component'

/**
 * Render a virtual node into a container element.
 */
export function render(vnode, container) {
	const dom = createElement(vnode)
	container.appendChild(dom)
}

/**
 * Recursively create DOM elements from the VDOM.
 */
function createElement(vnode) {
  // If vnode is a string, create a text node.
	if(typeof vnode === 'string') {
		return document.createTextNode(vnode);
	}
  
  // If the vnode type is a component, instantiate and render it.
	if(typeof vnode.type === 'function') {
		const component = new vnode.type(vnode.props);
		// Optionally call lifecycle hook.
		component.onMount();
		const renderedVNode = component.render();
		return createElement(renderedVNode);
	}

  // Otherwise, assume vnode.type is a standard HTML tag.
	const el = document.createElement(vnode.type)

	if(vnode.props) {
		for (const key in vnode.props) {
			if(key.startsWith('on')) {
        // Attach event listeners (e.g. onClick becomes 'click').
				el.addEventListener(key.substring(2).toLowerCase(), vnode.props[key]);
			} else {
				el.setAttribute(key, vnode.props[key]);
			}
		}
	}

  // Recursively create and append children.
	if(vnode.children) {
		vnode.children.forEach(child => el.appendChild(createElement(child)))
	}

	return el;
}

// NOTES: Enhancement
// A full diff/patch implementation would compare a new VDOM tree to the current one and update
// only the parts that have changed. This is a common optimization in frameworks like React and Vue.

