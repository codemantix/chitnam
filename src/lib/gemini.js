/**
 * Minimal Gemini API client (REST generateContent). SERVER ONLY.
 *
 * - The key comes from GEMINI_API_KEY and is sent in the x-goog-api-key
 *   header (never in the URL, so it can't end up in proxy or server logs).
 * - Model is configurable with GEMINI_MODEL. Default: gemini-3.6-flash
 *   (stable, fast, supports low "thinking"), checked against the Gemini
 *   docs on 24 Nov 2026.
 * - Never import this from a component: it would expose nothing useful in
 *   the browser bundle (the key is not NEXT_PUBLIC_), but it also wouldn't work.
 */

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
export const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function geminiModel() {
  return (process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL).trim();
}

/** A user-safe error with an HTTP status for the API route to pass on. */
export class GeminiError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

/**
 * Sends one prompt and returns the parsed JSON object the model produced.
 *
 * @param {object} options
 * @param {string} options.system System instruction (house rules).
 * @param {string} options.prompt The task, including the JSON shape expected.
 * @param {number} [options.maxOutputTokens=4096]
 * @param {number} [options.timeoutMs=60000]
 * @returns {Promise<{ data: object, usage: object|null, model: string }>}
 */
export async function generateJson({ system, prompt, maxOutputTokens = 4096, timeoutMs = 60000 }) {
  if (!isGeminiConfigured()) throw new GeminiError("The writing assistant isn't set up yet. Ask your developer to add its API key.", 503);

  const model = geminiModel();
  const generationConfig = { maxOutputTokens, responseMimeType: "application/json" };
  // Gemini 3+ models take a thinking level; older models reject the field.
  // "LOW" is accepted by every Gemini 3/4 model and keeps replies quick.
  if (/^gemini-[34]/.test(model)) generationConfig.thinkingConfig = { thinkingLevel: "LOW" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetch(`${API_BASE}/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw new GeminiError("The assistant took too long to reply. Please try again.", 504);
    throw new GeminiError("Couldn't reach the writing assistant. Please try again shortly.", 502);
  } finally {
    clearTimeout(timer);
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = body?.error?.message || response.statusText;
    // Log the provider's message for the developer; show staff a plain one.
    console.error(`[gemini] ${response.status} (${model}):`, detail);
    // 402: the Google project behind the key is on prepaid billing with no
    // credit left. Prepaid projects get no free usage until credit is added
    // or billing is unlinked (see docs/DEPLOYMENT.md → Writing assistant).
    if (response.status === 402 || /prepayment credits|billing/i.test(detail)) {
      throw new GeminiError("The assistant's Google account has run out of prepaid credit. Ask your developer to add credit or switch the API key to the free tier.", 503);
    }
    if (response.status === 429) throw new GeminiError("The assistant has hit its usage limit. Wait a minute and try again.", 429);
    if (response.status === 400 && /api key/i.test(detail)) throw new GeminiError("The assistant's API key was rejected. Ask your developer to check it.", 503);
    if (response.status === 401 || response.status === 403) throw new GeminiError("The assistant's API key was rejected. Ask your developer to check it.", 503);
    if (response.status === 404) throw new GeminiError("The assistant's AI model is no longer available. Ask your developer to update it.", 503);
    throw new GeminiError("The assistant couldn't complete that request. Please try again.", 502);
  }

  if (body?.promptFeedback?.blockReason) {
    throw new GeminiError("The assistant declined this request. Try rewording it.", 422);
  }
  const candidate = body?.candidates?.[0];
  const text = (candidate?.content?.parts || [])
    .filter((part) => !part.thought && typeof part.text === "string")
    .map((part) => part.text)
    .join("");

  if (!text) {
    const reason = candidate?.finishReason;
    if (reason === "MAX_TOKENS") throw new GeminiError("The reply was cut off because it was too long. Ask for a shorter piece.", 422);
    throw new GeminiError("The assistant returned an empty reply. Try rewording the request.", 422);
  }

  return { data: parseJson(text), usage: body.usageMetadata || null, model };
}

/** Parses model output as JSON, tolerating stray ```json fences. */
function parseJson(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        /* fall through */
      }
    }
    throw new GeminiError("The assistant's reply couldn't be read. Please try again.", 502);
  }
}
