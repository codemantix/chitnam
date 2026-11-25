import { getBusinessSettings } from "@/services/settings";

/**
 * Adds the business details (phones, email, address, social links…) from
 * /admin/settings/ to a public page's props, so the header, footer and
 * contact blocks always show the saved values. Server only.
 *
 * Saving the settings refreshes every public page straight away
 * (on-demand revalidation); `revalidate` is the fallback interval.
 *
 * @param {Function} [getStaticProps] The page's own getStaticProps, if any.
 * @param {{ revalidate?: number }} [options]
 */
export function withSiteSettings(getStaticProps, { revalidate = 3600 } = {}) {
  return async (context) => {
    const [result, business] = await Promise.all([
      getStaticProps ? getStaticProps(context) : { props: {} },
      getBusinessSettings(),
    ]);
    if (!result?.props) return result; // notFound or redirect
    const pageRevalidate = typeof result.revalidate === "number" ? Math.min(result.revalidate, revalidate) : revalidate;
    return { ...result, props: { ...result.props, business }, revalidate: pageRevalidate };
  };
}
