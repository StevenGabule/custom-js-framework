import {
  ChildrenPatch,
  PatchType,
  PropsPatch,
  VNode,
  VNodeChildren,
  VNodeProps,
} from "./types";

export class VDomDiffer {
  private static compareProps(
    oldProps: VNodeProps,
    newProps: VNodeProps
  ): PropsPatch {
    const add: VNodeProps = {};
    const remove: string[] = [];
    const update: VNodeProps = {};

    // Find props to remove
    for (const key in oldProps) {
      if (!(key in newProps)) {
        remove.push(key);
      }
    }

    // find props to add or update
    for (const key in newProps) {
      if (!(key in oldProps)) {
        add[key] = newProps[key];
      } else if (oldProps[key] !== newProps[key]) {
        update[key] = newProps[key];
      }
    }

    return { add, remove, update };
  }

  private static compareChildren(
    oldChildren: VNodeChildren,
    newChildren: VNodeChildren
  ): ChildrenPatch {
    const add: VNodeChildren = [];
    const remove: number[] = [];
    const update = new Map<number, PatchType>();

    // Use key-based reconciliation if keys are present
    const oldKeyMap = new Map<
      string | number,
      { vnode: VNode; index: number }
    >();
    const newKeyMap = new Map<
      string | number,
      { vnode: VNode; index: number }
    >();

    // build key map
    oldChildren.forEach((child, index) => {
      if (typeof child !== "string" && child.key != null) {
        oldKeyMap.set(child.key, { vnode: child, index });
      }
    });

    newChildren.forEach((child, index) => {
      if (typeof child !== "string" && child.key != null) {
        newKeyMap.set(child.key, { vnode: child, index });
      }
    });

    // handle keyed nodes
    if (oldKeyMap.size > 0 && newKeyMap.size > 0) {
      // remove old nodes that don't exist in new tree
      oldKeyMap.forEach(({ vnode, index }, key) => {
        if (!newKeyMap.has(key)) {
          remove.push(index);
        }
      });

      // add new nodes that don't exist in old tree
      newKeyMap.forEach(({ vnode, index }, key) => {
        if (!oldKeyMap.has(key)) {
          add.push(vnode);
        }
      });

      // update existing nodes
      newKeyMap.forEach(({ vnode: newNode, index: newIndex }, key) => {
        const old = oldKeyMap.get(key);
        if (old) {
          const patch = this.diff(old.vnode, newNode);
          if (patch) {
            update.set(old.index, patch);
          }
        }
      });
      return { add, remove, update };
    }

    // Fallback to index-based comparison for unkeyed nodes
    const maxLength = Math.max(oldChildren.length, newChildren.length);

    for (let i = 0; i < maxLength; i++) {
      const oldChild = oldChildren[i];
      const newChild = newChildren[i];

      if (!oldChild && newChild) {
        if (typeof newChild === "string") {
          add.push(newChild);
        } else {
          add.push(newChild);
        }
      } else if (oldChild && !newChild) {
        remove.push(i);
      } else if (oldChild && newChild) {
        if (typeof oldChild === "string" && typeof newChild === "string") {
          if (oldChild !== newChild) {
            update.set(i, { type: "REPLACE", vnode: newChild as any });
          }
        } else if (
          typeof oldChild !== "string" &&
          typeof newChild !== "string"
        ) {
          const patch = this.diff(oldChild, newChild);
          if (patch) {
            update.set(i, patch);
          }
        } else {
          update.set(i, { type: "REPLACE", vnode: newChild as any });
        }
      }
    }
    return { add, remove, update };
  }

  public static diff(oldNode: VNode, newNode: VNode): PatchType | null {
    // Different node types
    if (oldNode.type !== newNode.type) {
      return { type: "REPLACE", vnode: newNode };
    }

    // Same node type, check for differences
    const propsPatch = this.compareProps(oldNode.props, newNode.props);
    const childrenPatch = this.compareChildren(
      oldNode.children,
      newNode.children
    );

    // no changes
    if (
      Object.keys(propsPatch.add).length === 0 &&
      propsPatch.remove.length === 0 &&
      Object.keys(propsPatch.update).length === 0 &&
      childrenPatch.add.length === 0 &&
      childrenPatch.remove.length === 0 &&
      childrenPatch.update.size === 0
    ) {
      return null;
    }
    return {
      type: "UPDATE",
      props: propsPatch,
      children: childrenPatch,
    };
  }
}
