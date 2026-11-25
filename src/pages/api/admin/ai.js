import { draftPrompt, metaPrompt, outlinePrompt, REWRITE_MODES, rewritePrompt, SYSTEM_INSTRUCTION } from "@/lib/aiPrompts";
import { generateJson, GeminiError, isGeminiConfigured } from "@/lib/gemini";
import { allowMethods, sendError } from "@/lib/http";
import { checkRateLimit } from "@/lib/rateLimit";
import { sanitizePostHtml } from "@/lib/sanitizeHtml";
import { getAdminClient } from "@/lib/supabase/adminClient";
import { requireStaffApi } from "@/services/auth";
import { getSetting } from "@/services/settings";
import { slugify, cleanText } from "@/utils/validation";

// maxDuration: full drafts can take over a minute (Vercel honours this).
export const config = { api: { bodyParser: { sizeLimit: "200kb" }, responseLimit: "1mb" }, maxDuration: 120 };

// Per staff member. Generous for real writing, low enough to cap API costs
// if a session is ever misused.
const RATE_LIMIT = { limit: 40, windowSeconds: 60 * 60 };

const ACTIONS = ["outline", "draft", "rewrite", "meta"];
const clip = (value, max, multiline = false) => cleanText(value, { multiline }).slice(0, max);
const str = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");

/** Reads and limits the inputs for each action. Returns [input, error]. */
function readInput(action, body) {
  if (action === "outline" || action === "draft") {
    const input = {
      topic: clip(body.topic, 200),
      audience: clip(body.audience, 200),
      keyPoints: clip(body.keyPoints, 2000, true),
      tone: ["friendly", "professional", "simple"].includes(body.tone) ? body.tone : "friendly",
      length: ["short", "medium", "long"].includes(body.length) ? body.length : "medium",
      outline: Array.isArray(body.outline)
        ? body.outline.slice(0, 10).map((s) => ({
            heading: clip(s?.heading, 150),
            points: Array.isArray(s?.points) ? s.points.slice(0, 8).map((p) => clip(p, 200)) : [],
          }))
        : null,
    };
    if (input.topic.length < 5) return [null, "Describe the topic in a few words (at least 5 characters)."];
    return [input, null];
  }
  if (action === "rewrite") {
    const text = str(body.text, 8000);
    if (text.length < 3) return [null, "Select some text in the editor first."];
    return [{ text, mode: body.mode in REWRITE_MODES ? body.mode : "improve" }, null];
  }
  // meta
  const text = str(body.text, 30000);
  if (text.length < 200) return [null, "Write at least a few paragraphs first, then ask for suggestions."];
  return [{ title: clip(body.title, 200), text }, null];
}

/** Shapes and cleans the model's JSON for the editor. */
function shapeResult(action, data) {
  const s = (v, max) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
  if (action === "outline") {
    const sections = (Array.isArray(data.sections) ? data.sections : [])
      .slice(0, 10)
      .map((sec) => ({
        heading: s(sec?.heading, 150),
        points: (Array.isArray(sec?.points) ? sec.points : []).slice(0, 8).map((p) => s(p, 200)).filter(Boolean),
      }))
      .filter((sec) => sec.heading);
    return { title: s(data.title, 140), sections };
  }
  if (action === "draft") return { title: s(data.title, 140), html: sanitizePostHtml(String(data.html || "")) };
  if (action === "rewrite") return { html: sanitizePostHtml(String(data.html || "")) };
  return {
    titles: (Array.isArray(data.titles) ? data.titles : []).slice(0, 5).map((t) => s(t, 140)).filter(Boolean),
    excerpt: s(data.excerpt, 300),
    seoTitle: s(data.seoTitle, 70),
    seoDescription: s(data.seoDescription, 170),
    slug: slugify(s(data.slug, 120)),
  };
}

const PROMPTS = { outline: outlinePrompt, draft: draftPrompt, rewrite: rewritePrompt, meta: metaPrompt };
const TOKENS = { outline: 2048, draft: 8192, rewrite: 4096, meta: 2048 };

/**
 * POST /api/admin/ai — writing assistant for the post editor (staff only).
 * Body: { action: "outline" | "draft" | "rewrite" | "meta", ...inputs }
 * GET  /api/admin/ai — { configured: boolean } so the UI can show setup help.
 */
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST"])) return;
  const staff = await requireStaffApi(req, res);
  if (!staff) return;

  // Settings → Blog can switch the assistant off for the whole team.
  const { aiAssistantEnabled } = await getSetting(staff.supabase, "blog");
  if (req.method === "GET") return res.status(200).json({ ok: true, configured: isGeminiConfigured(), enabled: aiAssistantEnabled });
  if (!aiAssistantEnabled) return sendError(res, 403, "The writing assistant has been turned off in Settings → Blog.");

  const body = req.body || {};
  const action = ACTIONS.includes(body.action) ? body.action : null;
  if (!action) return sendError(res, 400, "Unknown assistant action.");

  const [input, inputError] = readInput(action, body);
  if (inputError) return sendError(res, 400, inputError);

  if (!isGeminiConfigured()) {
    return sendError(res, 503, "The writing assistant isn't set up yet. Ask your developer to add its API key.");
  }

  const admin = getAdminClient();
  if (admin) {
    const allowed = await checkRateLimit(admin, `ai:${staff.user.id}`, RATE_LIMIT);
    if (!allowed) return sendError(res, 429, "You've used the assistant a lot in the last hour. Please try again later.");
  }

  try {
    const { data } = await generateJson({
      system: SYSTEM_INSTRUCTION,
      prompt: PROMPTS[action](input),
      maxOutputTokens: TOKENS[action],
      timeoutMs: action === "draft" ? 90000 : 45000,
    });
    const result = shapeResult(action, data || {});
    if ((action === "draft" || action === "rewrite") && !result.html) {
      return sendError(res, 502, "The assistant's reply was empty. Please try again.");
    }
    return res.status(200).json({ ok: true, result });
  } catch (error) {
    if (error instanceof GeminiError) return sendError(res, error.status, error.message);
    console.error("[admin/ai]", error);
    return sendError(res, 500, "Something went wrong with the assistant. Please try again.");
  }
}
