import { Selector } from "./types";

export function createSelector<S, R1, Result>(
  selector1: Selector<S, R1>,
  resultFn: (r1: R1) => Result
): Selector<S, Result>;

export function createSelector<S, R1, R2, Result>(
  selector1: Selector<S, R1>,
  selector2: Selector<S, R2>,
  resultFn: (r1: R1, r2: R2) => Result
): Selector<S, Result>;

export function createSelector<S>(...args: any[]): Selector<S, any> {
  const selectors = args.slice(0, -1);
  const resultFn = args[args.length - 1];
  let lastResults: any[] | null = null;
  let lastValue: any;

  return (state: S) => {
    const results = selectors.map((selector) => selector(state));

    if (
      lastResults === null ||
      results.some((result, index) => result !== lastResults![index])
    ) {
      lastResults = results;
      lastValue = resultFn(...resultFn);
    }
    return lastValue;
  };
}
