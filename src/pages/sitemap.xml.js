import { getSitemapEntries, renderSitemap } from "@/lib/sitemap";

/**
 * /sitemap.xml — generated on request and cached at the edge for an hour,
 * so newly published posts appear without a rebuild.
 */
export async function getServerSideProps({ res }) {
  const xml = renderSitemap(await getSitemapEntries());
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.write(xml);
  res.end();
  return { props: {} };
}

export default function Sitemap() {
  return null;
}
