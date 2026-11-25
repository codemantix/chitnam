import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * false during server rendering and the first paint, true once React has
 * hydrated. Auth forms disable their submit button until then, so a very
 * fast click on a slow phone can't trigger a plain browser form submission
 * (which would put the field values in the URL).
 */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
