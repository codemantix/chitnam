import { ROUTES } from "@/constants/routes";

/**
 * Builds a breadcrumb trail that always starts at Home.
 * crumbs({ label: "Services", href: "/our-services/" }, …)
 */
export function crumbs(...items) {
  return [{ label: "Home", href: ROUTES.home }, ...items];
}
