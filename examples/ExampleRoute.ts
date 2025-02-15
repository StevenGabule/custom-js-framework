import { Router } from "../src/core/router/router";
import { RouteComponent } from "../src/core/router/types";

// Define route components
const UserProfileComponent: RouteComponent = {
  async render() {
    const element = document.createElement("div");
    const { params } = router.currentLocation!;

    element.innerHTML = `
      <h1>User ${params.id}</h1>
      <nav>
        <a href="/users/${params.id}/posts">Posts</a>
        <a href="/users/${params.id}/settings">Settings</a>
      </nav>
		`;
    return element;
  },
  async onEnter() {
    console.log("Entering profile page.");
  },
  async onLeave() {
    console.log("Leaving profile page.");
  },
};

const router = new Router({
  mode: "history",
  base: "",
  routes: [
    {
      path: "/",
      component: {
        render: () => {
          const element = document.createElement("div");
          element.innerHTML = "<h1>Hello page</h1>";
          return element;
        },
      },
    },
    {
      path: "/users/:id",
      component: UserProfileComponent,
    },
  ],
});

// Add global navigation guard
// router.beforeEach(async (to, from) => {
//   if (to.meta.requiresAuth) {
//     // Check authentication
//     return isAuthenticated();
//   }
//   return true;
// });

// // Listen for route changes
// router.subscribe((route) => {
//   updateUI(route);
// });
