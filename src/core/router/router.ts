import { PathToRegexp } from "./path-to-regexp";
import {
  Route,
  RouteLocation,
  RouteQuery,
  RouterGuard,
  RouterHooks,
  RouterOptions,
} from "./types";

export class Router {
  private routes: Route[];
  private currentRoute: RouteLocation | null = null;
  private mode: "hash" | "history";
  private base: string;
  private hooks: RouterHooks = {};
  private subscribers: Set<(route: RouteLocation) => void>;

  constructor(options: RouterOptions) {
    this.routes = options.routes;
    this.mode = options.mode || "history";
    this.base = options.base || "";
    this.subscribers = new Set();

    this.initializeRouter();
  }

  private initializeRouter(): void {
    // handle browser navigation events
    window.addEventListener("popstate", () => this.handleRoute());

    // handle initial route
    this.handleRoute();

    // handle clicks on links
    document.addEventListener("click", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "A" && target.getAttribute("href")) {
        e.preventDefault();
        const href = target.getAttribute("href")!;
        this.push(href);
      }
    });
  }

  private async handleRoute(): Promise<void> {
    const path = this.getCurrentPath();
    const matchedRoute = this.findRoute(path);

    if (!matchedRoute) {
      console.warn(`No route found for path: ${path}`);
      return;
    }

    const newLocation = this.createLocation(path, matchedRoute);
    const oldLocation = this.currentRoute;

    // run guards
    if (this.hooks.beforeEach) {
      const canProceed = await this.hooks.beforeEach(newLocation, oldLocation);
      if (!canProceed) return;
    }

    if (oldLocation && matchedRoute.component?.onLeave) {
      await matchedRoute.component.onLeave();
    }

    this.currentRoute = newLocation;

    if (matchedRoute.component?.onEnter) {
      await matchedRoute.component.onEnter();
    }

    // Render component
    if (matchedRoute.component) {
      const element = await matchedRoute.component.render();
      this.updateDOM(element);
    }

    // run after hook
    if (this.hooks.afterEach) {
      this.hooks.afterEach(newLocation, oldLocation);
    }

    // notify subscribers
    this.notify();
  }

  private getCurrentPath(): string {
    if (this.mode === "hash") {
      return window.location.hash.slice(1) || "/";
    }
    return window.location.pathname.slice(this.base.length) || "/";
  }

  private findRoute(path: string): Route | null {
    const findMatchingRoute = (
      routes: Route[],
      parentPath = ""
    ): Route | null => {
      for (const route of routes) {
        const fullPath = `${parentPath}${route.path}`;
        const regex = PathToRegexp.parse(fullPath);

        if (regex.test(path)) {
          if (route.redirect) {
            return this.findRoute(route.redirect);
          }
          return route;
        }

        if (route.children) {
          const childMatch = findMatchingRoute(route.children, fullPath);
          if (childMatch) return childMatch;
        }
      }
      return null;
    };

    return findMatchingRoute(this.routes);
  }

  private createLocation(path: string, route: Route): RouteLocation {
    const params = PathToRegexp.extractParams(route.path, path);
    const query = this.parseQuery(window.location.search);
    const hash = window.location.hash;
    return { path, params, query, hash };
  }

  private parseQuery(queryString: string): RouteQuery {
    const query: RouteQuery = {};
    const searchParams = new URLSearchParams(queryString);

    for (const [key, value] of searchParams.entries()) {
      if (key in query) {
        const existing = query[key];
        if (Array.isArray(existing)) {
          existing.push(value);
        } else {
          query[key] = [existing as string, value];
        }
      } else {
        query[key] = value;
      }
    }
    return query;
  }

  private updateDOM(element: Element): void {
    const container = document.getElementById("router-view");
    if (container) {
      container.innerHTML = "";
      container.appendChild(element);
    }
  }

  private notify(): void {
    if (this.currentRoute) {
      for (const subscriber of this.subscribers) {
        subscriber(this.currentRoute);
      }
    }
  }

  // public api
  public push(path: string): void {
    if (this.mode === "hash") {
      window.location.hash = path;
    } else {
      window.history.pushState(null, "", this.base + path);
      this.handleRoute();
    }
  }

  public replace(path: string): void {
    if (this.mode === "hash") {
      window.location.replace(`${window.location.pathname}#${path}`);
    } else {
      window.history.replaceState(null, "", this.base + path);
      this.handleRoute();
    }
  }

  public beforeEach(guard: RouterGuard): void {
    this.hooks.beforeEach = guard;
  }

  public afterEach(
    hook: (to: RouteLocation, from: RouteLocation | null) => void
  ): void {
    this.hooks.afterEach = hook;
  }

  public subscribe(callback: (route: RouteLocation) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  public get currentLocation(): RouteLocation | null {
    return this.currentRoute;
  }
}
