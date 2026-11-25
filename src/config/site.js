/**
 * Site-wide business details.
 *
 * Every value here is taken from the current live website
 * (chitnampenguinslink.com.ng, reviewed 18 Nov 2026). Fields marked
 * `verified: false` must be confirmed by the client before launch;
 * see docs/PROJECT_PLAN.md → "Open questions for the client".
 */

const siteUrl = (
  // Never a local address: if the variable is missing, fall back to the
  // public domain so canonical URLs, sitemap and share links stay correct.
  process.env.NEXT_PUBLIC_SITE_URL || "https://chitnampenguinslink.com.ng"
).replace(/\/+$/, "");

export const siteConfig = {
  name: "Chitnam Penguins Links",
  legalName: "Chitnam Penguins Links Limited",
  shortName: "Chitnam",
  url: siteUrl,
  locale: "en_NG",
  foundingYear: 2015,
  description:
    "Chitnam Penguins Links is a study abroad consultancy in Port Harcourt, Nigeria, helping students with course counselling, university admissions, student visa applications and pre-departure preparation since 2015.",

  // Search engines are blocked unless this is explicitly the production site,
  // so staging and preview deployments never get indexed by accident.
  indexable: process.env.NEXT_PUBLIC_SITE_ENV === "production",

  logo: {
    src: "/images/logo.png",
    width: 590,
    height: 223,
    alt: "Chitnam Penguins Links Limited",
  },
  // Link preview image (WhatsApp, Facebook, LinkedIn, X) for every page
  // without its own image. Uncropped 3:2 photo; Facebook and X centre-crop
  // it to about 1.91:1, which keeps the desk and advisers in frame.
  defaultOgImage: { src: "/images/photos/team-consultation-desk.jpg", width: 1296, height: 864, alt: "Chitnam Penguins Links advisers at a consultation desk" },

  address: {
    verified: false,
    street: "29 Ohiamini Crescent, Rumuola Link Road",
    locality: "Rumuigbo",
    city: "Port Harcourt",
    region: "Rivers State",
    country: "Nigeria",
    countryCode: "NG",
  },

  contact: {
    verified: false,
    email: "info@chitnampenguinslink.com.ng",
    // Display format and E.164 format for tel: links.
    phones: [
      { display: "0706 446 5640", tel: "+2347064465640" },
      { display: "0908 185 6122", tel: "+2349081856122" },
      { display: "+44 7904 866340", tel: "+447904866340", label: "UK" },
    ],
    // Not published on the current site. Leave null until the client
    // confirms which number accepts WhatsApp messages.
    whatsapp: null,
    officeHours: null,
  },

  social: {
    facebook: "https://www.facebook.com/profile.php?id=100046438376487",
    instagram: "https://www.instagram.com/chitnampenguinslimited/",
    linkedin: "https://www.linkedin.com/company/chitnam-penguins-link-limited/",
  },

  analytics: {
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || null,
    googleSiteVerification:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || null,
  },
};

// Display helpers for business details (address, maps link, social links)
// live in utils/settings.js, because staff can now edit those details in
// /admin/settings/. The values above are the defaults.
