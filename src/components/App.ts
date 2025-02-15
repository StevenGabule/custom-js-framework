import { BaseComponent } from "../core/component/base-component";
import { Component } from "../core/component/component";
import { ComponentProps } from "../core/component/types";

export class App extends Component {
  constructor(props: ComponentProps = {}) {
    super(props);
    this.state = {
      title: "Custom Framework",
    };
  }

  render(): Element {
    const div = document.createElement("div");
    div.className = "app";
    div.innerHTML = `
      <h1>${this.state.title}</h1>
      <main>
        <div id="router-view"></div>
      </main>
    `;
    return div;
  }
}
