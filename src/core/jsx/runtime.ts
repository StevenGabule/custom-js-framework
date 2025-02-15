import { Props, VNode } from "./types";

export function createElement(
  type: string | Function,
  props: Props = {},
  ...children: any[]
): VNode {
  // extract key and ref from props
  const { key, ref, ...restProps } = props;

  // Process children
  const processedChildren = children
    .flat(Infinity)
    .filter((child) => child != null)
    .map((child) =>
      typeof child === "string" || typeof child === "number"
        ? createTextNode(child)
        : child
    );

  // create VNode
  return { type, props: restProps, children: processedChildren, key, ref };
}

function createTextNode(text: string | number): VNode {
  return {
    type: "#text",
    props: {},
    children: [],
    key: undefined,
    ref: undefined,
    value: String(text),
  };
}
