import { VDomDiffer } from "./diff";
import { PropsPatch, VNode } from "./types";

export class VDomPatcher {
  private static patchProps(el: HTMLElement, patch: PropsPatch): void {
    // Remove old props
    patch.remove.forEach((key) => {
      if (key.startsWith("on")) {
        const eventName = key.slice(2).toLowerCase();
        el.removeEventListener(eventName, el[key as keyof HTMLElement] as any);
      } else {
        el.removeAttribute(key);
      }
    });

    // Add new props
    Object.entries(patch.add).forEach(([key, value]) => {
      if (key.startsWith("on")) {
        const eventName = key.slice(2).toLowerCase();
        el.addEventListener(eventName, value as EventListener);
      } else if (key === "className") {
        el.className = value;
      } else if (key === "style" && typeof value === "object") {
        Object.assign(el.style, value);
      } else {
        el.setAttribute(key, value);
      }
    });

    // Update existing props
    Object.entries(patch.update).forEach(([key, value]) => {
      if (key.startsWith("on")) {
        const eventName = key.slice(2).toLowerCase();
        el.removeEventListener(eventName, el[key as keyof HTMLElement] as any);
        el.addEventListener(eventName, value as EventListener);
      } else if (key === "className") {
        el.className = value;
      } else if (key === "style" && typeof value === "object") {
        Object.assign(el.style, value);
      } else {
        el.setAttribute(key, value);
      }
    });
  }

  private static createDOMNode(vnode: VNode | string): HTMLElement | Text {
    if (typeof vnode === "string") {
      return document.createTextNode(vnode);
    }

    const el = document.createElement(vnode.type as string);

    // set props
    Object.entries(vnode.props).forEach(([key, value]) => {
      if (key.startsWith("on")) {
        const eventName = key.slice(2).toLowerCase();
        el.addEventListener(eventName, value as EventListener);
      } else if (key === "className") {
        el.className = value;
      } else if (key === "style" && typeof value === "object") {
        Object.assign(el.style, value);
      } else {
        el.setAttribute(key, value);
      }
    });

    // add children
    vnode.children.forEach((child) => {
      el.appendChild(this.createDOMNode(child));
    });

    // Store reference to DOM node
    if (typeof vnode === "object") {
      vnode.el = el;
    }

    // Handle ref
    if (vnode.ref) {
      vnode.ref(el);
    }

    return el;
  }

  public static patch(
    parentElement: HTMLElement,
    oldVNode: VNode | null,
    newVNode: VNode | null,
    index: number = 0
  ): void {
    if (!oldVNode && newVNode) {
      // create new node
      const newEl = this.createDOMNode(newVNode);
      parentElement.appendChild(newEl);
      return;
    }

    if (oldVNode && !newVNode) {
      // Remove old node
      if (oldVNode.el) {
        parentElement.removeChild(oldVNode.el);
      }
      return;
    }

    if (!oldVNode || !newVNode) {
      return;
    }

    const el = oldVNode.el as HTMLElement;
    const patch = VDomDiffer.diff(oldVNode, newVNode);

    if (!patch) {
      return;
    }

    switch (patch.type) {
      case "REPLACE": {
        const newEl = this.createDOMNode(patch.vnode);
        if (el) {
          el.parentElement?.replaceChild(newEl, el);
        }
        break;
      }
      case "UPDATE": {
        if (el && el instanceof HTMLElement) {
          // Update props
          this.patchProps(el, patch.props);

          // Update children
          const oldChildren = oldVNode.children;
          const { add, remove, update } = patch.children;

          // Remove old children
          remove
            .sort((a, b) => b - a)
            .forEach((index) => {
              const child = oldChildren[index];
              if (typeof child !== "string" && child.el) {
                el.removeChild(child.el);
              }
            });

          // Update existing children
          update.forEach((childPatch, index) => {
            const oldChild = oldChildren[index];
            if (typeof oldChild !== "string" && oldChild.el) {
              this.patch(
                el,
                oldChild,
                childPatch.type === "REPLACE"
                  ? childPatch.vnode
                  : (newVNode.children[index] as VNode),
                index
              );
            }
          });

          add.forEach((child) => {
            el.appendChild(this.createDOMNode(child));
          });
        }
        break;
      }
    }
    newVNode.el = el;
    if (newVNode.ref) {
      newVNode.ref(el);
    }
  }
}
