import { Route } from "./types";

export class Router {
  private routes: Route[];
  private currentRoute: Route | null = null;
  private rootElement: Element | null = null;

  constructor(options: { routes: Route[] }) {
    this.routes = options.routes;
    this.init();
  }

  private init(): void {
    // Listen to browser navigation
    window.addEventListener("popstate", () => this.handleRoute());

    // Handle initial route
    this.handleRoute();

    // Handle link clicks
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.matches("a")) {
        e.preventDefault();
        const href = target.getAttribute("href");
        if (href) {
          this.navigate(href);
        }
      }
    });
  }

  public setRootElement(element: Element): void {
    this.rootElement = element;
    this.handleRoute(); // Re-render current route
  }

  private async handleRoute(): Promise<void> {
    const path = window.location.pathname;
    const route = this.findRoute(path);

    if (route) {
      // Call onLeave on current route if exists
      if (this.currentRoute?.component!.onLeave) {
        await this.currentRoute.component.onLeave();
      }

      this.currentRoute = route;

      // Call onEnter on new route if exists
      if (route.component!.onEnter) {
        await route.component!.onEnter();
      }

      // Render the new route
      this.renderRoute(route);
    } else {
      console.warn(`No route found for path: ${path}`);
    }
  }

  private findRoute(path: string): Route | null {
    return (
      this.routes.find((route) => {
        const pattern = this.pathToRegexp(route.path);
        return pattern.test(path);
      }) || null
    );
  }

  private pathToRegexp(path: string): RegExp {
    const pattern = path
      .replace(/\//g, "\\/") // Escape forward slashes
      .replace(/:(\w+)/g, "([^/]+)"); // Convert :params to capture groups
    return new RegExp(`^${pattern}$`);
  }

  private async renderRoute(route: Route): Promise<void> {
    if (!this.rootElement) {
      console.warn("Router root element not set");
      return;
    }

    // Clear current content
    this.rootElement.innerHTML = "";

    // Render new content
    const element = await route.component!.render();
    this.rootElement.appendChild(element);
  }

  public navigate(path: string): void {
    window.history.pushState(null, "", path);
    this.handleRoute();
  }
}
