export interface RouteParams {
  [key: string]: string;
}

export interface RouteQuery {
  [key: string]: string | string[];
}

export interface RouteLocation {
  path: string;
  params: RouteParams;
  query: RouteQuery;
  hash: string;
}

export interface RouteComponent {
  render: () => Promise<Element> | Element;
  onEnter?: () => Promise<void> | void;
  onLeave?: () => Promise<void> | void;
}

export interface Route {
  path: string;
  component: RouteComponent | null;
  name?: string;
  children?: Route[];
  redirect?: string;
  meta?: Record<string, any>;
}

export interface RouterOptions {
  routes: Route[];
  mode?: "hash" | "history";
  base?: string;
}

export type RouterGuard = (
  to: RouteLocation,
  from: RouteLocation | null
) => Promise<boolean> | boolean;

export interface RouterHooks {
  beforeEach?: RouterGuard;
  afterEach?: (to: RouteLocation, from: RouteLocation | null) => void;
}
