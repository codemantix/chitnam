import { siteConfig } from "@/config/site";

/**
 * /robots.txt — production allows crawling (except private areas) and points
 * to the sitemap; every other environment blocks all crawlers, so staging and
 * preview deployments can never be indexed.
 */
export function buildRobots(indexable = siteConfig.indexable) {
  if (!indexable) {
    return "# Non-production environment: do not index.\nUser-agent: *\nDisallow: /\n";
  }
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin/",
    "Disallow: /api/",
    "Disallow: /dev/",
    "",
    `Sitemap: ${siteConfig.url}/sitemap.xml`,
    "",
  ].join("\n");
}

export async function getServerSideProps({ res }) {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
  res.write(buildRobots());
  res.end();
  return { props: {} };
}

export default function Robots() {
  return null;
}
