import { createContext, useContext } from "react";
import { DEFAULTS } from "@/utils/settings";

/**
 * Business details (contact, address, social) for public components.
 * Provided in _app from the page's `business` prop (see withSiteSettings);
 * pages without it (404 before data, 500, admin) get the defaults.
 */
export const BusinessContext = createContext(DEFAULTS.business);

export function useBusiness() {
  return useContext(BusinessContext);
}
