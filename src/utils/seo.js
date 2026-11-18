import { siteConfig } from "@/config/site";

const TITLE_SEPARATOR = " | ";

/** Turns a site-relative path into an absolute URL with a trailing slash. */
export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  const withLeading = path.startsWith("/") ? path : `/${path}`;
  // Files (e.g. /images/x.jpg) keep their extension; pages get a trailing slash.
  const isFile = /\.[a-z0-9]+$/i.test(withLeading);
  const normalised =
    isFile || withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
  return `${siteConfig.url}${normalised}`;
}

const TITLE_MAX = 60;

/**
 * "Page title | Chitnam Penguins Links", or just the site name on the homepage.
 * Search results cut titles at about 60 characters, so long titles get the
 * short brand name, and very long ones none at all.
 */
export function buildTitle(title) {
  if (!title || title === siteConfig.name) return siteConfig.name;
  for (const brand of [siteConfig.name, siteConfig.shortName]) {
    const full = `${title}${TITLE_SEPARATOR}${brand}`;
    if (full.length <= TITLE_MAX) return full;
  }
  return title;
}

/** Search engines truncate around 155–160 characters. */
export function clampDescription(text = "", max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}
