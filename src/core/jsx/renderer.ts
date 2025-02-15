import { VNode } from "./types";

export class Renderer {
  public render(vnode: VNode, container: HTMLElement): void {
    container.innerHTML = "";
    container.appendChild(this.createDOMElement(vnode));
  }

  private createDOMElement(vnode: VNode): HTMLElement | Text {
    if (vnode.type === "#text") {
      return document.createTextNode(vnode.value as string);
    }

    if (typeof vnode.type === "function") {
      return this.createDOMElement((vnode.type as Function)(vnode.props));
    }

    const element = document.createElement(vnode.type as string);

    // Set properties
    for (const [key, value] of Object.entries(vnode.props)) {
      if (key === "style" && typeof value === "object") {
        Object.assign(element.style, value);
      } else if (key.startsWith("on") && key.length > 2) {
        element.addEventListener(key.substring(2).toLowerCase(), value);
      } else {
        element.setAttribute(key, value);
      }
    }

    // add children
    for (const child of vnode.children) {
      element.appendChild(this.createDOMElement(child));
    }

    // Handle ref
    if (vnode.ref) {
      vnode.ref(element);
    }

    return element;
  }
}
