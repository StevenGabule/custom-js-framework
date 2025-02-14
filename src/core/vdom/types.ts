export type VNodeChildren = Array<VNode | string>;

export interface VNodeProps {
  [key: string]: any;
  key?: string | number;
  ref?: (el: Element | null) => void;
  className?: string;
  style?: Partial<CSSStyleDeclaration> | string;
  onClick?: (event: MouseEvent) => void;
  onInput?: (event: Event) => void;
  onChange?: (event: Event) => void;
}

export interface VNode {
  type: string | Function;
  props: VNodeProps;
  children: VNodeChildren;
  key?: string | number;
  ref?: (el: Element | null) => void;
  el?: HTMLElement | Text | null;
}

export type PatchType =
  | { type: "CREATE"; vnode: VNode }
  | { type: "REMOVE" }
  | { type: "REPLACE"; vnode: VNode }
  | { type: "UPDATE"; props: PropsPatch; children: ChildrenPatch };

export interface PropsPatch {
  add: VNodeProps;
  remove: string[];
  update: VNodeProps;
}

export interface ChildrenPatch {
  add: VNodeChildren;
  remove: number[];
  update: Map<number, PatchType>;
}
