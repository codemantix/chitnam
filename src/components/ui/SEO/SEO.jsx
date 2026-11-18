import Head from "next/head";
import { siteConfig } from "@/config/site";
import { absoluteUrl, buildTitle, clampDescription } from "@/utils/seo";

/**
 * Page metadata via next/head. Use once per page.
 *
 * @param {object} props
 * @param {string} props.title Page title without the site name.
 * @param {string} props.description Unique, specific summary of the page.
 * @param {string} props.path Canonical site-relative path, e.g. "/about-us/".
 * @param {string} [props.image] Social image path or URL (defaults to the 1200×630 site image).
 * @param {string} [props.imageAlt]
 * @param {"website"|"article"} [props.type="website"]
 * @param {boolean} [props.noindex] Force noindex (admin, previews, 404).
 * @param {object[]} [props.jsonLd] Structured data objects from utils/schema.js.
 * @param {{ publishedTime?: string, modifiedTime?: string, author?: string }} [props.article]
 */
export default function SEO({
  title,
  description,
  path,
  image,
  imageAlt,
  type = "website",
  noindex = false,
  jsonLd = [],
  article,
}) {
  const fullTitle = buildTitle(title);
  const metaDescription = clampDescription(description || siteConfig.description);
  const canonical = absoluteUrl(path || "/");
  const og = siteConfig.defaultOgImage;
  const imageUrl = absoluteUrl(image || og.src);
  const imageText = imageAlt || (image ? siteConfig.name : og.alt);
  const shouldIndex = siteConfig.indexable && !noindex;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta
        name="robots"
        content={shouldIndex ? "index, follow, max-image-preview:large" : "noindex, nofollow"}
      />
      {/* A noindexed page should not declare itself canonical. */}
      {shouldIndex && <link rel="canonical" href={canonical} />}

      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:locale" content={siteConfig.locale} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={imageUrl} />
      {!image && <meta property="og:image:width" content={String(og.width)} />}
      {!image && <meta property="og:image:height" content={String(og.height)} />}
      <meta property="og:image:alt" content={imageText} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={imageText} />

      {type === "article" && article?.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {type === "article" && article?.modifiedTime && (
        <meta property="article:modified_time" content={article.modifiedTime} />
      )}
      {type === "article" && article?.author && (
        <meta property="article:author" content={article.author} />
      )}

      {jsonLd.map((schema, index) => (
        <script
          key={`jsonld-${index}`}
          type="application/ld+json"
          // JSON.stringify output is safe here once "<" is escaped,
          // which prevents a value from closing the script tag early.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </Head>
  );
}
