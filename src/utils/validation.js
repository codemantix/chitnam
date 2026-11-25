import { DESTINATION_OPTIONS, INTEREST_OPTIONS, STUDY_LEVEL_OPTIONS } from "@/constants/enquiry";
import { htmlToText } from "@/utils/html";

/**
 * Validation shared by the browser (instant feedback) and the API routes
 * (the authoritative check). Plain JavaScript, no dependencies.
 *
 * Each validator returns { data, errors }:
 *  - data: cleaned values, safe to store
 *  - errors: { field: "Message shown to the user" } (empty when valid)
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_ALLOWED = /^\+?[\d\s\-().]+$/;
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Trims, collapses inner whitespace and strips control characters. */
export function cleanText(value, { multiline = false } = {}) {
  if (typeof value !== "string") return "";
  const withoutControls = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  if (multiline) {
    return withoutControls
      .replace(/\r\n?/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }
  return withoutControls.replace(/\s+/g, " ").trim();
}

const isOneOf = (options, value) => options.some((option) => option.value === value);

/**
 * @param {object} input Raw form values.
 * @param {"apply"|"contact"} source Which form was used.
 */
export function validateEnquiry(input = {}, source = "apply", { requirePhone = false } = {}) {
  const errors = {};
  const isApply = source === "apply";

  const data = {
    source: isApply ? "apply" : "contact",
    full_name: cleanText(input.fullName),
    email: cleanText(input.email).toLowerCase(),
    phone: cleanText(input.phone) || null,
    destination: cleanText(input.destination) || null,
    study_level: cleanText(input.studyLevel) || null,
    field_of_interest: cleanText(input.fieldOfInterest) || null,
    interest: cleanText(input.interest) || null,
    message: cleanText(input.message, { multiline: true }) || null,
    consent: input.consent === true || input.consent === "true" || input.consent === "on",
  };

  if (data.full_name.length < 2) errors.fullName = "Please enter your full name.";
  else if (data.full_name.length > 120) errors.fullName = "Please keep your name under 120 characters.";

  if (!data.email) errors.email = "Please enter your email address.";
  else if (data.email.length > 254 || !EMAIL_PATTERN.test(data.email))
    errors.email = "Please enter a valid email address, like name@example.com.";

  if (data.phone) {
    const digits = data.phone.replace(/\D/g, "");
    if (!PHONE_ALLOWED.test(data.phone) || digits.length < 7 || digits.length > 15)
      errors.phone = "Please enter a valid phone number, like 0803 123 4567 or +234 803 123 4567.";
  } else if (isApply || requirePhone) {
    errors.phone = "Please enter a phone number so an adviser can call you.";
  }

  if (isApply) {
    if (!data.destination) errors.destination = "Please choose a study destination.";
    else if (!isOneOf(DESTINATION_OPTIONS, data.destination)) errors.destination = "Please choose an option from the list.";

    if (!data.study_level) errors.studyLevel = "Please choose the level you want to study.";
    else if (!isOneOf(STUDY_LEVEL_OPTIONS, data.study_level)) errors.studyLevel = "Please choose an option from the list.";

    if (!data.field_of_interest) errors.fieldOfInterest = "Please tell us the course or subject you're interested in.";
    else if (data.field_of_interest.length > 120) errors.fieldOfInterest = "Please keep this under 120 characters.";
  } else {
    // The contact form doesn't ask for these; ignore anything sent.
    data.destination = null;
    data.study_level = null;
    data.field_of_interest = null;
  }

  if (data.interest && !isOneOf(INTEREST_OPTIONS, data.interest)) data.interest = null;

  if (!isApply && (!data.message || data.message.length < 10))
    errors.message = "Please write a short message (at least 10 characters).";
  else if (data.message && data.message.length > 2000)
    errors.message = "Please keep your message under 2,000 characters.";

  if (!data.consent) errors.consent = "Please confirm you agree to the privacy policy so we can reply.";

  return { data, errors };
}

/** Converts a title to a URL slug: "Study in Australia!" → "study-in-australia". */
export function slugify(text = "") {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
    .replace(/-+$/g, "");
}

/** Validates a blog post from the admin editor. */
export function validatePost(input = {}) {
  const errors = {};
  const data = {
    title: cleanText(input.title),
    slug: cleanText(input.slug).toLowerCase(),
    excerpt: cleanText(input.excerpt),
    // HTML from the rich-text editor. Sanitised on the server before saving.
    body: typeof input.body === "string" ? input.body.trim() : "",
    cover_image_path: cleanText(input.coverImagePath) || null,
    cover_image_alt: cleanText(input.coverImageAlt) || null,
    category_id: cleanText(input.categoryId) || null,
    author_id: cleanText(input.authorId) || null,
    status: input.status === "published" ? "published" : "draft",
    published_at: input.publishedAt ? new Date(input.publishedAt) : null,
    seo_title: cleanText(input.seoTitle) || null,
    seo_description: cleanText(input.seoDescription) || null,
  };

  if (data.title.length < 3) errors.title = "Add a title (at least 3 characters).";
  else if (data.title.length > 140) errors.title = "Keep the title under 140 characters.";

  if (!data.slug) data.slug = slugify(data.title);
  if (!SLUG_PATTERN.test(data.slug) || data.slug.length > 100)
    errors.slug = "Use lowercase letters, numbers and single hyphens only, e.g. study-in-australia.";

  if (data.excerpt.length < 20) errors.excerpt = "Write a short summary (at least 20 characters).";
  else if (data.excerpt.length > 300) errors.excerpt = "Keep the summary under 300 characters.";

  if (data.body.length > 200000) errors.body = "The article is too long. Try splitting it into two posts.";
  if (data.status === "published" && htmlToText(data.body).length < 200)
    errors.body = "Published articles need at least 200 characters of text.";

  if (data.cover_image_path && !data.cover_image_alt)
    errors.coverImageAlt = "Describe the cover image for people who can't see it (and for search engines).";
  if (data.cover_image_alt && data.cover_image_alt.length > 200)
    errors.coverImageAlt = "Keep the description under 200 characters.";

  if (data.published_at && Number.isNaN(data.published_at.getTime())) {
    errors.publishedAt = "Enter a valid date.";
    data.published_at = null;
  }
  if (data.status === "published" && !data.published_at) data.published_at = new Date();
  data.published_at = data.published_at ? data.published_at.toISOString() : null;

  if (data.seo_title && data.seo_title.length > 70) errors.seoTitle = "Keep the SEO title under 70 characters.";
  if (data.seo_description && data.seo_description.length > 170)
    errors.seoDescription = "Keep the SEO description under 170 characters.";

  return { data, errors };
}

export const hasErrors = (errors) => Object.keys(errors).length > 0;

/** Validates a new blog category from the admin editor. */
export function validateCategory(input = {}) {
  const errors = {};
  const name = cleanText(input.name);
  const data = {
    name,
    slug: cleanText(input.slug).toLowerCase() || slugify(name),
    description: cleanText(input.description) || null,
  };
  if (name.length < 2) errors.name = "Enter a category name (at least 2 characters).";
  else if (name.length > 60) errors.name = "Keep the name under 60 characters.";
  if (!SLUG_PATTERN.test(data.slug) || data.slug.length > 60) errors.name = errors.name || "Use letters and numbers in the name.";
  if (data.description && data.description.length > 300) errors.description = "Keep the description under 300 characters.";
  return { data, errors };
}

const STAFF_ROLES = ["admin", "editor"];

/** Validates a team invitation from /admin/team/. */
export function validateInvite(input = {}) {
  const errors = {};
  const data = {
    email: cleanText(input.email).toLowerCase(),
    fullName: cleanText(input.fullName),
    role: STAFF_ROLES.includes(input.role) ? input.role : "",
    jobTitle: cleanText(input.jobTitle),
    sendEmail: input.sendEmail !== false,
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email) || data.email.length > 254) errors.email = "Enter a valid email address.";
  if (data.fullName.length < 2) errors.fullName = "Enter their full name.";
  else if (data.fullName.length > 120) errors.fullName = "Keep the name under 120 characters.";
  if (!data.role) errors.role = "Choose a role.";
  if (data.jobTitle.length > 80) errors.jobTitle = "Keep the job title under 80 characters.";
  return { data, errors };
}

/** Validates a staff member's own profile (name and job title). */
export function validateProfile(input = {}) {
  const errors = {};
  const data = { fullName: cleanText(input.fullName), jobTitle: cleanText(input.jobTitle) };
  if (data.fullName.length < 2) errors.fullName = "Enter your full name.";
  else if (data.fullName.length > 120) errors.fullName = "Keep your name under 120 characters.";
  if (data.jobTitle.length > 80) errors.jobTitle = "Keep the job title under 80 characters.";
  return { data, errors };
}
