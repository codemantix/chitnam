import { useCallback } from "react";
import { useRouter } from "next/router";

/**
 * Returns a function that tells whether a nav href matches the current page.
 * "/" matches only the homepage; other links also match their sub-pages,
 * so "/our-services/" stays active on "/our-services/student-visa-guidance/".
 */
export function useIsActive() {
  const { asPath } = useRouter();
  const path = asPath.split(/[?#]/)[0];

  return useCallback(
    (href) => (href === "/" ? path === "/" : path.startsWith(href)),
    [path]
  );
}
