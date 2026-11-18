import sanitize from "sanitize-html";

/**
 * SERVER ONLY. Cleans article HTML from the admin editor.
 *
 * Runs when a post is saved (API) and again when it is rendered
 * (getStaticProps), so even content edited directly in the database is
 * made safe. Anything not on these lists is removed: scripts, iframes,
 * event handlers, inline styles other than text alignment, and unsafe
 * URL schemes such as javascript:.
 */
const OPTIONS = {
  allowedTags: [
    "p", "br", "h2", "h3", "h4", "strong", "em", "u", "s", "a",
    "ul", "ol", "li", "blockquote", "hr", "img", "code", "pre",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "title"],
    img: ["src", "alt", "title", "width", "height", "loading", "decoding"],
    p: ["style"],
    h2: ["style"],
    h3: ["style"],
    h4: ["style"],
  },
  allowedStyles: {
    "*": { "text-align": [/^(left|right|center|justify)$/] },
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["https"] },
  allowProtocolRelative: false,
  transformTags: {
    // The page title is the only h1.
    h1: "h2",
    h5: "h4",
    h6: "h4",
    b: "strong",
    i: "em",
    del: "s",
    strike: "s",
    // Article images load lazily; the cover image above the text is the LCP.
    img: (tagName, attribs) => ({ tagName: "img", attribs: { ...attribs, loading: "lazy", decoding: "async" } }),
    a: (tagName, attribs) => {
      const attrs = { href: attribs.href, ...(attribs.title && { title: attribs.title }) };
      if (attribs.target === "_blank") {
        attrs.target = "_blank";
        attrs.rel = "noopener noreferrer";
      }
      return { tagName: "a", attribs: attrs };
    },
  },
  // Drop empty paragraphs the editor leaves behind (keeps spacing consistent)
  // and images whose src was removed as unsafe.
  exclusiveFilter: (frame) =>
    (frame.tag === "p" && !frame.text.trim() && !frame.mediaChildren.length) ||
    (frame.tag === "img" && !frame.attribs.src),
};

export function sanitizePostHtml(html = "") {
  return sanitize(String(html), OPTIONS).trim();
}
