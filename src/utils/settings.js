import { siteConfig } from "@/config/site";
import { cleanText } from "@/utils/validation";

/**
 * Site settings edited in /admin/settings/ and stored in the `settings`
 * table (one JSON object per key). Shared by the browser (forms) and the
 * server (API, page data).
 *
 * The values in config/site.js are the DEFAULTS: if a setting has never
 * been saved, or the database can't be reached, the site uses them.
 */

export const SETTINGS_KEYS = ["business", "blog", "enquiries"];

export const SOCIAL_NETWORKS = [
  { key: "facebook", label: "Facebook", host: /(^|\.)facebook\.com$|(^|\.)fb\.com$/ },
  { key: "instagram", label: "Instagram", host: /(^|\.)instagram\.com$/ },
  { key: "linkedin", label: "LinkedIn", host: /(^|\.)linkedin\.com$/ },
  { key: "x", label: "X (Twitter)", host: /(^|\.)(x|twitter)\.com$/ },
  { key: "youtube", label: "YouTube", host: /(^|\.)youtube\.com$|(^|\.)youtu\.be$/ },
  { key: "tiktok", label: "TikTok", host: /(^|\.)tiktok\.com$/ },
];

export const DEFAULTS = {
  business: {
    email: siteConfig.contact.email,
    phones: siteConfig.contact.phones.map((p) => ({ display: p.display, tel: p.tel, label: p.label || "" })),
    whatsapp: siteConfig.contact.whatsapp || "",
    officeHours: siteConfig.contact.officeHours || "",
    address: {
      street: siteConfig.address.street,
      locality: siteConfig.address.locality,
      city: siteConfig.address.city,
      region: siteConfig.address.region,
    },
    social: Object.fromEntries(SOCIAL_NETWORKS.map((n) => [n.key, siteConfig.social[n.key] || ""])),
  },
  blog: {
    defaultAuthorId: "",
    defaultCategoryId: "",
    postsPerPage: 9,
    aiAssistantEnabled: true,
  },
  enquiries: {
    requirePhoneOnContact: false,
    autoCloseAfterDays: 0, // 0 = off
    deleteClosedAfterMonths: 0, // 0 = off
  },
};

/** Saved value merged over the defaults (handles missing or partial rows). */
export function withDefaults(key, value) {
  const base = DEFAULTS[key];
  const saved = value && typeof value === "object" ? value : {};
  if (key === "business") {
    return {
      ...base,
      ...saved,
      phones: Array.isArray(saved.phones) && saved.phones.length ? saved.phones : base.phones,
      address: { ...base.address, ...(saved.address || {}) },
      social: { ...base.social, ...(saved.social || {}) },
    };
  }
  return { ...base, ...saved };
}

// ---------------------------------------------------------------------
// Helpers for showing business details
// ---------------------------------------------------------------------

export const formatAddress = (address) =>
  [address.street, address.locality, address.city, address.region].filter(Boolean).join(", ");

export const mapsUrl = (address) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [address.street, address.locality, address.city, address.region, siteConfig.address.country].filter(Boolean).join(", ")
  )}`;

export const socialLinksFrom = (social = {}) =>
  SOCIAL_NETWORKS.filter((n) => social[n.key]).map((n) => ({ key: n.key, label: n.label, href: social[n.key] }));

export const whatsappUrl = (number) => (number ? `https://wa.me/${number.replace(/\D/g, "")}` : null);

// ---------------------------------------------------------------------
// Validation (returns { data, errors })
// ---------------------------------------------------------------------

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS = /^[+()\d\s-]{7,20}$/;

/** "0706 446 5640" → "+2347064465640"; "+44 7904…" kept international. */
export function toE164(display) {
  const digits = display.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return `+${digits.slice(1).replace(/\D/g, "")}`;
  if (digits.startsWith("234")) return `+${digits}`;
  if (digits.startsWith("0")) return `+234${digits.slice(1)}`;
  return `+${digits}`;
}

function validUrlFor(network, value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && network.host.test(url.hostname.replace(/^www\./, ""));
  } catch {
    return false;
  }
}

export function validateBusiness(input = {}) {
  const errors = {};
  const text = (v, max) => cleanText(v).slice(0, max);
  const data = {
    email: text(input.email, 254).toLowerCase(),
    phones: (Array.isArray(input.phones) ? input.phones : [])
      .slice(0, 5)
      .map((p) => ({ display: text(p?.display, 25), label: text(p?.label, 20) }))
      .filter((p) => p.display)
      .map((p) => ({ ...p, tel: toE164(p.display) })),
    whatsapp: text(input.whatsapp, 25),
    officeHours: text(input.officeHours, 120),
    address: {
      street: text(input.address?.street, 120),
      locality: text(input.address?.locality, 80),
      city: text(input.address?.city, 80),
      region: text(input.address?.region, 80),
    },
    social: Object.fromEntries(SOCIAL_NETWORKS.map((n) => [n.key, text(input.social?.[n.key], 300)])),
  };

  if (!EMAIL.test(data.email)) errors.email = "Enter a valid email address.";
  if (data.phones.length === 0) errors.phones = "Add at least one phone number.";
  data.phones.forEach((p, i) => {
    if (!PHONE_CHARS.test(p.display) || p.tel.replace(/\D/g, "").length < 10)
      errors[`phone${i}`] = "Enter a valid phone number, e.g. 0803 123 4567 or +44 7900 123456.";
  });
  if (data.whatsapp && (!PHONE_CHARS.test(data.whatsapp) || data.whatsapp.replace(/\D/g, "").length < 10))
    errors.whatsapp = "Enter the WhatsApp number with country code, e.g. +234 803 123 4567.";
  if (data.whatsapp) data.whatsapp = toE164(data.whatsapp);
  if (!data.address.street) errors.street = "Enter the street address.";
  if (!data.address.city) errors.city = "Enter the city.";
  SOCIAL_NETWORKS.forEach((n) => {
    if (data.social[n.key] && !validUrlFor(n, data.social[n.key]))
      errors[`social_${n.key}`] = `Enter a full ${n.label} link starting with https://`;
  });
  return { data, errors };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const intIn = (v, min, max, fallback) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

export function validateBlog(input = {}) {
  const data = {
    defaultAuthorId: UUID.test(input.defaultAuthorId || "") ? input.defaultAuthorId : "",
    defaultCategoryId: UUID.test(input.defaultCategoryId || "") ? input.defaultCategoryId : "",
    postsPerPage: intIn(input.postsPerPage, 3, 48, DEFAULTS.blog.postsPerPage),
    aiAssistantEnabled: input.aiAssistantEnabled !== false,
  };
  return { data, errors: {} };
}

export function validateEnquirySettings(input = {}) {
  const data = {
    requirePhoneOnContact: input.requirePhoneOnContact === true,
    autoCloseAfterDays: intIn(input.autoCloseAfterDays, 0, 365, 0),
    deleteClosedAfterMonths: intIn(input.deleteClosedAfterMonths, 0, 120, 0),
  };
  return { data, errors: {} };
}

export const SETTINGS_VALIDATORS = { business: validateBusiness, blog: validateBlog, enquiries: validateEnquirySettings };
