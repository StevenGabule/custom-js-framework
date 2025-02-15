// import { Component } from "../src/core/component/component";
// import { ComponentProps, ComponentState } from "../src/core/component/types";

// class MyComponent extends Component {
//   constructor(props: ComponentProps) {
//     super(props);
//   }

//   protected getInitialState(): ComponentState {
//     return {
//       count: 0,
//       message: "Hello",
//     };
//   }

//   protected getInitialRefs(): { [key: string]: any } {
//     return {
//       buttonRef: null,
//       inputRef: null,
//     };
//   }

//   public override beforeCreate(): void {
//     console.log("before component create");
//   }

//   created(): void {
//     console.log("Component did mount");
//   }

//   beforeMount(): void {
//     console.log("Before mounting");
//   }

//   mounted(): void {
//     console.log("Component mounted");
//   }

//   beforeUpdate(): void {
//     console.log("Before update");
//   }

//   updated(): void {
//     console.log("Component updated");
//   }

//   beforeUnmount(): void {
//     console.log("Before unmounting");
//   }

//   unmounted(): void {
//     console.log("Component unmounted");
//   }

//   errorCaptured(error: Error, component: Component): boolean {
//     console.error(`Error in component: ${error.message}`);
//     return true; // Allow error to propagate
//   }

//   protected render(): Element {
//     const div = document.createElement("div");
//     div.innerHTML = `
//       <div>
//         <h1>${this.state.message}</h1>
//         <p>Count: ${this.state.count}</p>
//         <button ref="buttonRef">Increment</button>
//         <input ref="inputRef" type="text" value="${this.state.message}">
//       </div>
// 		`;
//     const button = div.querySelector("button");
//     if (button) {
//       this.refs.buttonRef.value = button;
//       button.addEventListener("click", () => {
//         this.setState({ count: this.state.count + 1 });
//       });
//     }
//     const input = div.querySelector("input");
//     if (input) {
//       this.refs.inputRef.value = input;
//       input.addEventListener("input", (e) => {
//         this.setState({ message: (e.target as HTMLInputElement).value });
//       });
//     }
//     return div;
//   }
// }

// export default MyComponent;
