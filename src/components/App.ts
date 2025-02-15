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

  public mounted(): void {
    // Set router root element after component is mounted
    const routerView = document.getElementById("router-view");
    if (routerView && this.props.router) {
      this.props.router.setRootElement(routerView);
    }
  }

  render(): Element {
    const div = document.createElement("div");
    div.className = "app";
    div.innerHTML = `
      <h1>${this.state.title}</h1>
      <nav>
        <a href="/">Home</a>
        <a href="/users/1">User Profile</a>
      </nav>
      <main>
        <div id="router-view"></div>
      </main>
    `;
    return div;
  }
}
