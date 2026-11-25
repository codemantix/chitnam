import { ROUTES } from "@/constants/routes";

/**
 * Rebuilds the public pages affected by a post change, so readers see it
 * immediately instead of waiting for the ISR interval. Failures are logged,
 * not thrown: the content is saved either way and ISR will catch up.
 *
 * @param {import('next').NextApiResponse} res
 * @param {string[]} slugs Post slugs whose pages changed (old and new).
 */
export async function revalidateBlog(res, slugs = []) {
  const paths = [ROUTES.home, ROUTES.blog, ...slugs.filter(Boolean).map((slug) => ROUTES.post(slug))];
  const results = await Promise.allSettled([...new Set(paths)].map((path) => res.revalidate(path)));
  results.forEach((result, index) => {
    if (result.status === "rejected") console.error("[revalidate]", paths[index], result.reason?.message);
  });
}

/**
 * Rebuilds every public page (used when business details change, since the
 * header and footer on every page show them). Server only.
 */
export async function revalidatePublicSite(res) {
  const { services } = await import("@/data/services");
  const { getPublishedPosts } = await import("@/services/posts");
  const posts = await getPublishedPosts().catch(() => []);
  const paths = [
    ROUTES.home,
    ROUTES.about,
    ROUTES.services,
    ...services.map((s) => ROUTES.service(s.slug)),
    ROUTES.partners,
    ROUTES.blog,
    ...posts.map((p) => ROUTES.post(p.slug)),
    ROUTES.apply,
    ROUTES.contact,
    ROUTES.privacy,
    ROUTES.disclaimer,
    "/404",
  ];
  const results = await Promise.allSettled(paths.map((path) => res.revalidate(path)));
  const failed = results.filter((r) => r.status === "rejected").length;
  if (failed) console.error(`[revalidate] ${failed} of ${paths.length} pages failed to refresh; they update within the hour.`);
  return { total: paths.length, failed };
}
