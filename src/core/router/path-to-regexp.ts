import { RouteParams } from "./types";

export class PathToRegexp {
  private static paramRegex = /:([^/]+)/g;
  private static wildcardRegex = /\*([^/]+)/g;

  public static parse(path: string): RegExp {
    let parsePath = path
      .replace(this.paramRegex, "([^/]+)")
      .replace(this.wildcardRegex, "(.*)");

    return new RegExp(`${parsePath}`);
  }

  public static extractParams(path: string, match: string): RouteParams {
    const params: RouteParams = {};
    const paramMatches = Array.from(path.matchAll(this.paramRegex));
    const values = match.match(this.parse(path))?.slice(1) || [];

    paramMatches.forEach((param, index) => {
      params[param[1]] = values[index];
    });

    return params;
  }
}
