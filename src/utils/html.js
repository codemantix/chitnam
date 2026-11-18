/**
 * Light HTML helpers that are safe to use in the browser and on the server.
 * They only read text; they are NOT a sanitiser (see lib/sanitizeHtml.js).
 */

/** Visible text of an HTML string, whitespace collapsed. */
export function htmlToText(html = "") {
  return String(html)
    .replace(/<(br|\/p|\/h[1-6]|\/li|\/blockquote)\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(html = "") {
  const text = htmlToText(html);
  return text ? text.split(" ").length : 0;
}

/** Reading time at ~220 words per minute, at least 1 minute. */
export function readingMinutes(html = "") {
  return Math.max(1, Math.round(wordCount(html) / 220));
}
