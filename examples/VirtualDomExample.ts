import { VDomPatcher } from "./../src/core/vdom/patch";
import { createElement } from "../src/core/vdom/create";

const oldVNode = createElement(
  "div",
  { className: "container" },
  createElement("h1", {}, "Hello"),
  createElement("p", { key: "1" }, "Old Text")
);

const newVNode = createElement(
  "div",
  { className: "container active" },
  createElement("h1", {}, "Hello World"),
  createElement("p", { key: "1" }, "New text"),
  createElement(
    "button",
    { onClick: () => console.log("clicked") },
    "Click me!"
  )
);

// initial render
const container = document.getElementById("app");
if (container) {
  VDomPatcher.patch(container, null, oldVNode);

  // update after some time
  setTimeout(() => {
    VDomPatcher.patch(container, oldVNode, newVNode);
  }, 1000);
}
