import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/utils/seo";
import { DEFAULTS, socialLinksFrom } from "@/utils/settings";

/**
 * JSON-LD builders. Pass the result to <SEO jsonLd={[...]} />.
 * Only facts the site already shows are used (config/site.js plus the
 * business details from /admin/settings/).
 */

export function organizationSchema(business = DEFAULTS.business) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.legalName,
    alternateName: siteConfig.name,
    url: absoluteUrl("/"),
    logo: absoluteUrl(siteConfig.logo.src),
    foundingDate: String(siteConfig.foundingYear),
    email: business.email,
    sameAs: socialLinksFrom(business.social).map((link) => link.href),
  };
}

/**
 * LocalBusiness for the Port Harcourt office (local search).
 * Opening hours are omitted until the client confirms them.
 */
export function localBusinessSchema(business = DEFAULTS.business) {
  const { address } = business;
  const contact = business;
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "EducationalOrganization"],
    "@id": `${siteConfig.url}/#office`,
    name: siteConfig.legalName,
    url: absoluteUrl("/"),
    image: absoluteUrl(siteConfig.defaultOgImage.src),
    logo: absoluteUrl(siteConfig.logo.src),
    email: contact.email,
    telephone: contact.phones[0]?.tel,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.region,
      addressCountry: siteConfig.address.countryCode,
    },
    areaServed: { "@type": "Country", name: "Nigeria" },
    parentOrganization: { "@id": `${siteConfig.url}/#organization` },
  };
}

/** @param {{ title: string, seoDescription: string, slug: string }} service */
export function serviceSchema(service, path) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.seoDescription,
    url: absoluteUrl(path),
    serviceType: service.title,
    areaServed: { "@type": "Country", name: "Nigeria" },
    provider: { "@id": `${siteConfig.url}/#organization` },
  };
}

/** BlogPosting structured data for an article page. */
export function articleSchema(post, path) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    url: absoluteUrl(path),
    mainEntityOfPage: absoluteUrl(path),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    ...(post.coverImage && { image: [post.coverImage] }),
    ...(post.category && { articleSection: post.category.name }),
    // Group bylines (slug ending "-team", e.g. the seeded "chitnam-advisory-team")
    // are organisations, not people.
    author:
      post.author && !post.author.slug?.endsWith("-team")
        ? { "@type": "Person", name: post.author.name, ...(post.author.role && { jobTitle: post.author.role }) }
        : { "@type": "Organization", name: post.author?.name || siteConfig.legalName, url: absoluteUrl("/") },
    publisher: { "@id": `${siteConfig.url}/#organization` },
    inLanguage: "en-NG",
  };
}

/** @param {{ question: string, answer: string }[]} faqs — must match the visible FAQ text. */
export function faqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/** @param {{ label: string, href: string }[]} items — first item should be Home. */
export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  };
}
