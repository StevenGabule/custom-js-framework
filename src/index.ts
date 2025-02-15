import { Component } from "./core/component/component";
import { Application } from "./core/App";
import { Route } from "./core/router/types";
import { StoreOptions } from "./core/store/types";
import { HomeComponent } from "./components/Home";
import { UserProfileComponent } from "./components/UserProfile";
import { App } from "./components/App";

export interface Plugin {
  name: string;
  install: (app: Application) => void;
}
export interface AppOptions {
  name?: string;
  routes?: Route[];
  store?: StoreOptions<any>;
  components?: Record<string, typeof Component>;
  plugins?: Plugin[];
  devtools?: boolean;
}

// Create routes
const routes: Route[] = [
  {
    path: "/",
    component: {
      render: () => new HomeComponent().render(),
      onEnter: async () => {
        const component = new HomeComponent();
        await component.beforeMount?.();
        return;
      },
      onLeave: async () => {
        const component = new HomeComponent();
        await component.beforeUnmount?.();
        return;
      },
    },
  },
  {
    path: "/users/:id",
    component: {
      // @ts-ignore
      render: () => new UserProfileComponent().render(),
      onEnter: async () => {
        // @ts-ignore
        const component = new UserProfileComponent();
        await component.beforeMount?.();
        return;
      },
      onLeave: async () => {
        // @ts-ignore
        const component = new UserProfileComponent();
        await component.beforeUnmount?.();
        return;
      },
    },
  },
];

interface AppState {
  user: {
    name: string;
    isAuthenticated: boolean;
  };
  theme: "light" | "dark";
}
// Create store
const store = {
  initialState: {
    user: {
      name: "",
      isAuthenticated: false,
    },
    theme: "light",
  },
  reducers: {
    SET_USER: (state: AppState, action: any) => ({
      ...state,
      user: action.payload,
    }),
    TOGGLE_THEME: (state: AppState) => ({
      ...state,
      theme: state.theme === "light" ? "dark" : "light",
    }),
  },
};

// Create application instance
const app = new Application({
  name: "MyApp",
  routes,
  components: {
    App,
    HomeComponent,
    UserProfileComponent,
  },
  devtools: true,
});

// Mount application
// @ts-ignore
app.mount(App, "#root");
