export type Props = Record<string, any>;

export interface VNode {
  type: string | Function;
  props: Props;
  children: VNode[];
  key?: string | number;
  ref?: (el: HTMLElement | null) => void;
  value?: string;
}

export type Component = (props: Props) => VNode;

declare global {
  namespace JSX {
    interface Element extends VNode {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }
  }
}
