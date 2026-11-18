import { ROUTES } from "@/constants/routes";
import { partners } from "@/data/partners";
import { services } from "@/data/services";
import { getPublishedPosts } from "@/services/posts";
import { absoluteUrl } from "@/utils/seo";

/**
 * Builds the list of indexable URLs. Pages that are `noindex` (admin, dev,
 * an empty partners page or blog) are deliberately left out, so the sitemap
 * never contradicts the robots meta tags.
 *
 * @returns {Promise<{ loc: string, lastmod?: string, changefreq: string, priority: number }[]>}
 */
export async function getSitemapEntries() {
  const posts = await getPublishedPosts();

  const entry = (path, priority, changefreq = "monthly", lastmod) => ({
    loc: absoluteUrl(path),
    priority,
    changefreq,
    ...(lastmod && { lastmod: new Date(lastmod).toISOString() }),
  });

  return [
    entry(ROUTES.home, 1.0, "weekly", posts[0]?.publishedAt),
    entry(ROUTES.about, 0.8),
    entry(ROUTES.services, 0.9),
    ...services.map((service) => entry(ROUTES.service(service.slug), 0.8)),
    ...(partners.length ? [entry(ROUTES.partners, 0.6)] : []),
    ...(posts.length
      ? [
          entry(ROUTES.blog, 0.7, "weekly", posts[0].publishedAt),
          ...posts.map((post) => entry(ROUTES.post(post.slug), 0.6, "monthly", post.updatedAt || post.publishedAt)),
        ]
      : []),
    entry(ROUTES.apply, 0.7),
    entry(ROUTES.contact, 0.7),
    entry(ROUTES.privacy, 0.2, "yearly"),
    entry(ROUTES.disclaimer, 0.2, "yearly"),
  ];
}

const escapeXml = (value) =>
  String(value).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);

export function renderSitemap(entries) {
  const urls = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${escapeXml(e.loc)}</loc>\n${e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>\n` : ""}    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority.toFixed(1)}</priority>\n  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
