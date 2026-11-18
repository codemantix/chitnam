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
