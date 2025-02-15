import { Component } from "../core/component/component";
import { ComponentProps } from "../core/component/types";

export class UserProfileComponent extends Component {
  constructor(props: ComponentProps = {}) {
    super(props);
    this.state = {
      user: null,
      loading: true,
    };
  }

  render(): Element {
    const div = document.createElement("div");
    div.className = "user-profile";

    // if (this.state.loading) {
    //   div.innerHTML = "<p>Loading...</p>";
    //   return div;
    // }

    // const user = this.state.user;
    div.innerHTML = `
      <h2>User Profile</h2>
      <div class="user-info">
        <p>Name:asd</p>
        <p>Email: asd</p>
      </div>
    `;
    return div;
  }
}
