import { siteConfig } from "@/config/site";

/**
 * Prompts for the admin writing assistant (Gemini). SERVER ONLY.
 *
 * The system instruction carries the site's content rules, so every
 * request follows them: nothing invented, facts to verify are flagged,
 * plain and specific language.
 */

export const SYSTEM_INSTRUCTION = `You are a writing assistant for the blog of ${siteConfig.legalName}, a study abroad consultancy in Port Harcourt, Nigeria (founded ${siteConfig.foundingYear}). It helps Nigerian students with course counselling, university admissions, student visa applications and pre-departure preparation. Its readers are students and parents in Nigeria.

House rules — follow all of them:
1. Never invent facts. No made-up statistics, percentages, fees, deadlines, visa rules, success rates, testimonials, quotes, case studies, partnerships, awards or staff names.
2. Immigration rules, fees, deadlines and entry requirements change often. When the text needs such a fact, write it generally and add an inline marker in square brackets for the editor, e.g. [CHECK: current visa application fee on the official UK government site]. Never present such a figure as certain.
3. Never promise or imply guaranteed admission, visas, scholarships or jobs.
4. Write in clear British English as used in Nigeria. Short paragraphs, plain words, practical steps. Speak to the reader as "you".
5. Avoid filler and hype. Do not use phrases such as "in today's fast-paced world", "unlock your potential", "embark on a journey", "navigate the complexities", "delve", "game-changer", "seamless", "look no further".
6. Do not mention that you are an AI. Do not add a sign-off or a call to contact the agency unless asked; the website adds its own.
7. When asked for HTML, use only these tags: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>. No <h1>, no inline styles, no scripts, no links.
8. Always reply with a single JSON object in exactly the shape requested, with no text before or after it.`;

const TONES = {
  friendly: "warm and encouraging, but practical",
  professional: "professional and reassuring",
  simple: "very simple, for readers new to studying abroad",
};

const LENGTHS = {
  short: "about 500 words",
  medium: "about 900 words",
  long: "about 1,400 words",
};

export const REWRITE_MODES = {
  improve: "Improve clarity and flow while keeping the meaning and roughly the same length.",
  shorten: "Make it about half as long, keeping the key points.",
  expand: "Expand it with more practical detail and explanation (about twice as long). Do not invent facts; flag any with [CHECK: …].",
  simplify: "Rewrite it in simpler words for a secondary school leaver.",
  grammar: "Fix spelling, grammar and punctuation only. Change nothing else.",
  friendlier: "Make the tone warmer and more encouraging without adding hype.",
};

const brief = ({ topic, audience, keyPoints, tone }) =>
  [
    `Topic: ${topic}`,
    audience && `Audience: ${audience}`,
    keyPoints && `Points the editor wants covered:\n${keyPoints}`,
    `Tone: ${TONES[tone] || TONES.friendly}`,
  ]
    .filter(Boolean)
    .join("\n");

export function outlinePrompt(input) {
  return `Create an outline for a blog article.

${brief(input)}

Reply as JSON:
{"title": "a clear, specific headline under 70 characters",
 "sections": [{"heading": "section heading", "points": ["what this section covers", "..."]}]}

Use 4 to 7 sections. Order them as a reader would need them. The first section should not be called "Introduction".`;
}

export function draftPrompt(input) {
  const outline = input.outline?.length
    ? `\nFollow this outline (headings may be lightly improved):\n${input.outline
        .map((s) => `- ${s.heading}${s.points?.length ? `: ${s.points.join("; ")}` : ""}`)
        .join("\n")}\n`
    : "";
  return `Write a complete blog article.

${brief(input)}
Length: ${LENGTHS[input.length] || LENGTHS.medium}
${outline}
Start with one or two short paragraphs (no heading) that tell the reader what they will learn. Use <h2> for sections and <h3> only for sub-sections. Use lists for steps and checklists. End with a short practical summary section.

Reply as JSON:
{"title": "headline under 70 characters", "html": "the article body as HTML"}`;
}

export function rewritePrompt({ text, mode }) {
  return `Rewrite the passage below. ${REWRITE_MODES[mode] || REWRITE_MODES.improve}
Keep any existing [CHECK: …] markers. If the passage is a single paragraph, return a single <p>. Keep lists as lists.

Passage:
"""
${text}
"""

Reply as JSON:
{"html": "the rewritten passage as HTML"}`;
}

export function metaPrompt({ title, text }) {
  return `Here is a blog article${title ? ` titled "${title}"` : ""}:
"""
${text}
"""

Suggest publishing details for it. Reply as JSON:
{"titles": ["3 alternative headlines, each under 70 characters"],
 "excerpt": "a 1–2 sentence summary for the blog listing, 120–250 characters",
 "seoTitle": "a search result title under 60 characters, without the site name",
 "seoDescription": "a search result description of 140–160 characters",
 "slug": "a short URL slug, lowercase words joined by hyphens, max 6 words"}`;
}
