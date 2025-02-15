import { declare } from "@babel/helper-plugin-utils";
import { NodePath, PluginPass, types as t } from "@babel/core";

interface JSXAttribute {
  name: { name: string };
  value: { expression?: any; value?: string };
}

export default declare((api: any) => {
  api.assertVersion(7);

  return {
    name: "babel-plugin-custom-jsx",
    manipulateOptions(opts: any, parseOpts: any) {
      parseOpts.plugins.push("jsx", "typescript");
    },
    visitor: {
      JSXElement(path: NodePath<t.JSXElement>, state: PluginPass) {
        const openingElement = path.node.openingElement;
        const tagName = getTagName(openingElement);
        const attributes = openingElement.attributes;
        const children = path.node.children;

        // convert props
        // @ts-ignore
        const props = attributes.map((attr: JSXAttribute) => {
          // @ts-ignore
          if (attr.type === "JSXSpreadAttribute") {
            // @ts-ignore
            return t.spreadElement(attr.argument);
          }
          const name = attr.name.name;
          const value = attr.value?.expression || attr.value;

          // Handle special cases
          if (name === "className") {
            return t.objectProperty(t.identifier("class"), value);
          }

          // Handle event handlers
          if (name.startsWith("on") && name.length > 2) {
            const eventName = name.charAt(2).toLowerCase() + name.slice(3);
            return t.objectProperty(t.identifier(`on${eventName}`), value);
          }

          return t.objectProperty(t.identifier(name), value);
        });

        // convert children
        const processChildren = children
          .map((child: any) => {
            if (t.isJSXText(child)) {
              return t.stringLiteral(child.value.trim());
            }
            if (t.isJSXExpressionContainer(child)) {
              return child.expression;
            }
            return child;
          })
          .filter((child) => {
            if (t.isStringLiteral(child)) {
              return child.value.length > 0;
            }
            return true;
          });

        // create createElement call
        path.replaceWith(
          t.callExpression(t.identifier("createElement"), [
            typeof tagName === "string" ? t.stringLiteral(tagName) : tagName,
            t.objectExpression(props),
            ...processChildren,
          ])
        );
      },
    },
  };
});

function getTagName(name: any): string | t.Identifier {
  if (name.type === "JSXIdentifier") {
    return name.name.toLowerCase();
  }
  if (name.type === "JSXMemberExpression") {
    return t.identifier(`${name.object.name}.${name.property.name}`);
  }
  throw new Error(`Unsupported JSX tag type: ${name.type}`);
}
