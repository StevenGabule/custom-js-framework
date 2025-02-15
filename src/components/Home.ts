import { BaseComponent } from "../core/component/base-component";
import { Component } from "../core/component/component";
import { ComponentProps } from "../core/component/types";

export class HomeComponent extends Component {
  constructor(props: ComponentProps = {}) {
    super(props);
    this.state = {
      welcomeMessage: "Welcome to Our App!",
    };
  }

  render(): Element {
    const div = document.createElement("div");
    div.className = "home";
    div.innerHTML = `
      <h2>${this.state.welcomeMessage}</h2>
      <p>This is the home page.</p>
    `;
    return div;
  }
}
