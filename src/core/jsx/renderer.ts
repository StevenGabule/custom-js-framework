import { VNode } from "./types";
import { BaseComponent } from "../component/base-component";

export class Renderer {
  public render(vnode: VNode, container: HTMLElement): void {
    // Clear container
    container.innerHTML = "";

    // Create and append DOM element
    const element = this.createDOMElement(vnode);
    container.appendChild(element);
  }

  private createDOMElement(vnode: VNode): HTMLElement | Text {
    // Handle text nodes
    if (typeof vnode === "string") {
      return document.createTextNode(vnode);
    }

    // Handle component types
    if (typeof vnode.type === "function") {
      // Check if it's a component class (constructor)
      if (vnode.type.prototype instanceof BaseComponent) {
        const ComponentClass = vnode.type as new (props: any) => BaseComponent;
        const component = new ComponentClass(vnode.props);
        // @ts-ignore
        return component.render();
      }
      // Handle functional components
      const element = (vnode.type as Function)(vnode.props);
      return this.createDOMElement(element);
    }

    // Handle regular DOM elements
    const element = document.createElement(vnode.type as string);

    // Set properties
    for (const [key, value] of Object.entries(vnode.props)) {
      if (key.startsWith("on") && key.length > 2) {
        const eventName = key.substring(2).toLowerCase();
        element.addEventListener(eventName, value as EventListener);
      } else if (key === "className") {
        element.className = value;
      } else if (key === "style" && typeof value === "object") {
        Object.assign(element.style, value);
      } else {
        element.setAttribute(key, value);
      }
    }

    // Add children
    vnode.children.forEach((child) => {
      element.appendChild(this.createDOMElement(child));
    });

    // Handle ref
    if (vnode.ref) {
      vnode.ref(element);
    }

    return element;
  }
}
