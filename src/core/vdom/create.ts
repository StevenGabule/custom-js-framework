import { VNode, VNodeChildren, VNodeProps } from "./types";

export function createElement(
  type: string | Function,
  props: VNodeProps = {},
  ...children: VNodeChildren
): VNode {
  // Extract key and ref from props
  const { key, ref, ...restProps } = props;

  // flatten children array and filter out null/undefined
  const flattenedChildren = children
    .flat(Infinity)
    .filter(
      (child): child is VNode | string => child !== null && child !== undefined
    );

  return {
    type,
    props: restProps,
    children: flattenedChildren,
    key,
    ref,
  };
}
