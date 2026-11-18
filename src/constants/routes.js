/**
 * Canonical public paths. Always include the trailing slash so links match
 * `trailingSlash: true` in next.config.js and avoid an extra redirect hop.
 */
export const ROUTES = {
  home: "/",
  about: "/about-us/",
  services: "/our-services/",
  service: (slug) => `/our-services/${slug}/`,
  partners: "/partners/",
  blog: "/blog/",
  post: (slug) => `/blog/${slug}/`,
  apply: "/apply-now/",
  contact: "/contact-us/",
  privacy: "/privacy-policy/",
  disclaimer: "/disclaimer/",
};

/** Primary navigation, used by the header and mobile menu. */
export const MAIN_NAV = [
  { label: "About", href: ROUTES.about },
  { label: "Services", href: ROUTES.services },
  { label: "Partners", href: ROUTES.partners },
  { label: "Blog", href: ROUTES.blog },
  { label: "Contact", href: ROUTES.contact },
];

export const LEGAL_NAV = [
  { label: "Privacy policy", href: ROUTES.privacy },
  { label: "Disclaimer", href: ROUTES.disclaimer },
];
