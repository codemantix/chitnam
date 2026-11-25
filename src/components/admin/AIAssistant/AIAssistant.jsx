import { useState } from "react";
import Modal from "@/components/admin/Modal/Modal";
import Field from "@/components/forms/Field/Field";
import Alert from "@/components/ui/Alert/Alert";
import Button from "@/components/ui/Button/Button";
import Icon from "@/components/ui/Icon/Icon";
import proseStyles from "@/components/ui/Prose/Prose.module.css";
import { cn } from "@/utils/cn";
import styles from "./AIAssistant.module.css";

const TABS = [
  { id: "draft", label: "Write a draft", icon: "posts" },
  { id: "rewrite", label: "Rewrite selection", icon: "sparkle" },
  { id: "meta", label: "Title & SEO", icon: "search" },
];

const REWRITE_MODES = [
  { id: "improve", label: "Improve" },
  { id: "shorten", label: "Shorten" },
  { id: "expand", label: "Expand" },
  { id: "simplify", label: "Simplify" },
  { id: "grammar", label: "Fix grammar" },
  { id: "friendlier", label: "Friendlier" },
];

const TONE_OPTIONS = [
  { value: "friendly", label: "Friendly and practical" },
  { value: "professional", label: "Professional" },
  { value: "simple", label: "Very simple" },
];
const LENGTH_OPTIONS = [
  { value: "short", label: "Short · ~500 words" },
  { value: "medium", label: "Medium · ~900 words" },
  { value: "long", label: "Long · ~1,400 words" },
];

async function callAssistant(action, payload) {
  const response = await fetch("/api/admin/ai/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  }).catch(() => null);
  if (!response) throw new Error("We couldn't reach the server. Check your connection.");
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "The assistant couldn't complete that request.");
  return data.result;
}

/** Shown while Gemini is working. */
function Working({ label }) {
  return (
    <div className={cn(styles.working, "flex items-center gap-3")} role="status" aria-live="polite">
      <span className={styles.orb} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

/** Reminder shown on every generated text. */
function ReviewNote() {
  return (
    <p className={cn(styles.note, "flex items-start gap-2")}>
      <Icon name="eye" size={16} />
      <span>
        Read it through before publishing. Replace every <code>[CHECK: …]</code> note with a verified fact from an
        official source, or delete it.
      </span>
    </p>
  );
}

/**
 * Gemini writing assistant for the post editor.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {{ id: number, tab: "draft"|"rewrite"|"meta", selection: object|null }} props.session
 *   Created each time the assistant is opened (selection captured at that moment).
 * @param {{ current: object|null }} props.editorApi From ClassicEditor's apiRef.
 * @param {{ title: string, body: string }} props.post Current editor values.
 * @param {(field: string, value: string) => void} props.onApply Sets a post field (title, excerpt, seoTitle, seoDescription, slug).
 * @param {boolean|null} props.configured Whether the server has a Gemini key (null = unknown).
 */
export default function AIAssistant({ open, onClose, session, editorApi, post, onApply, configured }) {
  const [tab, setTab] = useState(session.tab);
  const [busyLabel, setBusyLabel] = useState("");
  const busy = Boolean(busyLabel);
  const [error, setError] = useState("");
  const selection = session.selection;

  // Draft
  const [brief, setBrief] = useState({ topic: "", audience: "", keyPoints: "", tone: "friendly", length: "medium" });
  const [outline, setOutline] = useState(null); // { title, sections: [{ heading, points }] }
  const [draft, setDraft] = useState(null); // { title, html }

  // Rewrite
  const [rewriteMode, setRewriteMode] = useState("improve");
  const [rewrite, setRewrite] = useState(null); // { html }

  // Meta
  const [meta, setMeta] = useState(null);
  const [applied, setApplied] = useState({});

  // A new session (the assistant was opened again): switch to the requested
  // tab and drop any stale rewrite. Draft work is kept between openings.
  // (Adjusting state during render is React's recommended pattern here.)
  const [sessionId, setSessionId] = useState(session.id);
  if (session.id !== sessionId) {
    setSessionId(session.id);
    setTab(session.tab);
    setRewrite(null);
    setError("");
  }

  const run = async (label, action, payload, onDone) => {
    setBusyLabel(label);
    setError("");
    try {
      onDone(await callAssistant(action, payload));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyLabel("");
    }
  };

  const setBriefField = (event) => setBrief((b) => ({ ...b, [event.target.name]: event.target.value }));
  const editorText = () => editorApi.current?.getText?.() || "";
  // From the post state (not the editor ref), so it is safe to read while rendering.
  const editorHasContent = post.body.replace(/<[^>]*>/g, "").trim().length > 0;

  const insertDraft = (how) => {
    if (!draft) return;
    if (how === "replace") editorApi.current?.setContent(draft.html);
    else editorApi.current?.appendContent(draft.html);
    if (draft.title && (!post.title || how === "replace")) onApply("title", draft.title);
    onClose();
  };

  const updateSection = (index, heading) =>
    setOutline((o) => ({ ...o, sections: o.sections.map((s, i) => (i === index ? { ...s, heading } : s)) }));
  const removeSection = (index) => setOutline((o) => ({ ...o, sections: o.sections.filter((_, i) => i !== index) }));
  const moveSection = (index, delta) =>
    setOutline((o) => {
      const sections = [...o.sections];
      const target = index + delta;
      if (target < 0 || target >= sections.length) return o;
      [sections[index], sections[target]] = [sections[target], sections[index]];
      return { ...o, sections };
    });

  const footer = (() => {
    if (tab === "draft") {
      if (draft)
        return (
          <>
            <Button type="button" variant="ghost" onClick={() => setDraft(null)} disabled={busy}>
              Back
            </Button>
            {editorHasContent && (
              <Button type="button" variant="secondary" onClick={() => insertDraft("append")}>
                Add to end
              </Button>
            )}
            <Button type="button" onClick={() => insertDraft("replace")}>
              {editorHasContent ? "Replace article" : "Insert into editor"}
            </Button>
          </>
        );
      if (outline)
        return (
          <>
            <Button type="button" variant="ghost" onClick={() => setOutline(null)} disabled={busy}>
              Back to brief
            </Button>
            <Button
              type="button"
              loading={busy}
              disabled={busy || outline.sections.length === 0}
              onClick={() => run("Writing the draft from your outline…", "draft", { ...brief, outline: outline.sections }, setDraft)}
            >
              Write draft from outline
            </Button>
          </>
        );
      return (
        <>
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => run("Planning an outline…", "outline", brief, setOutline)}
          >
            Create outline first
          </Button>
          <Button type="button" loading={busy} disabled={busy} onClick={() => run("Writing your draft… this can take up to a minute.", "draft", brief, setDraft)}>
            Write full draft
          </Button>
        </>
      );
    }
    if (tab === "rewrite") {
      if (rewrite)
        return (
          <>
            <Button type="button" variant="ghost" onClick={() => setRewrite(null)}>
              Try another style
            </Button>
            <Button
              type="button"
              onClick={() => {
                editorApi.current?.replaceRange(selection, rewrite.html);
                onClose();
              }}
            >
              Replace selection
            </Button>
          </>
        );
      return (
        <Button
          type="button"
          loading={busy}
          disabled={busy || !selection}
          onClick={() => run("Rewriting…", "rewrite", { text: selection.text, mode: rewriteMode }, setRewrite)}
        >
          Rewrite
        </Button>
      );
    }
    return (
      <Button
        type="button"
        loading={busy}
        disabled={busy}
        onClick={() => {
          setApplied({});
          run("Reading your article…", "meta", { title: post.title, text: editorText() }, setMeta);
        }}
      >
        {meta ? "Suggest again" : "Suggest title and SEO"}
      </Button>
    );
  })();

  const applyMeta = (field, value) => {
    onApply(field, value);
    setApplied((a) => ({ ...a, [field]: value }));
  };

  return (
    <Modal open={open} onClose={onClose} title="Writing assistant" size="xl" footer={configured === false ? null : footer}>
      <div className="flex flex-col gap-5">
        <div className={cn(styles.banner, "flex items-center gap-3")}>
          <span className={styles.bannerIcon} aria-hidden="true">
            <Icon name="sparkle" size={18} />
          </span>
          <p className="text-sm">
            The assistant drafts and suggests; <strong>you check facts and decide what gets published.</strong>
          </p>
        </div>

        {configured === false ? (
          <Alert tone="info" title="The assistant isn't set up yet">
            Ask your developer to add the assistant&rsquo;s API key to the website&rsquo;s settings (see docs/DEPLOYMENT.md).
          </Alert>
        ) : (
          <>
            <div role="tablist" aria-label="Assistant tools" className={styles.tabs}>
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => {
                    setTab(t.id);
                    setError("");
                  }}
                  className={cn(styles.tab, tab === t.id && styles.tabActive)}
                >
                  <Icon name={t.icon} size={16} />
                  {t.label}
                </button>
              ))}
            </div>

            {error && <Alert tone="error" title={error} />}
            {busy && <Working label={busyLabel} />}

            {/* ---------------- Draft ---------------- */}
            {tab === "draft" && !busy && !outline && !draft && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field
                    id="ai-topic"
                    name="topic"
                    label="What is the article about?"
                    required
                    hint="Be specific, e.g. “How to prepare for a UK student visa interview”."
                    value={brief.topic}
                    onChange={setBriefField}
                    maxLength={200}
                    data-autofocus
                  />
                </div>
                <Field id="ai-audience" name="audience" label="Who is it for?" hint="e.g. “parents of SS3 students”." value={brief.audience} onChange={setBriefField} maxLength={200} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field as="select" id="ai-tone" name="tone" label="Tone" required placeholderOption={false} options={TONE_OPTIONS} value={brief.tone} onChange={setBriefField} />
                  <Field as="select" id="ai-length" name="length" label="Length" required placeholderOption={false} options={LENGTH_OPTIONS} value={brief.length} onChange={setBriefField} />
                </div>
                <div className="md:col-span-2">
                  <Field
                    as="textarea"
                    rows={4}
                    id="ai-points"
                    name="keyPoints"
                    label="Points to cover"
                    hint="One per line: your own advice, things students often get wrong, facts you have checked."
                    value={brief.keyPoints}
                    onChange={setBriefField}
                    maxLength={2000}
                  />
                </div>
              </div>
            )}

            {tab === "draft" && !busy && outline && !draft && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-ink-600">
                  Suggested title: <strong className="text-ink-900">{outline.title}</strong>. Edit, reorder or remove sections, then write the draft.
                </p>
                <ol className="flex flex-col gap-2">
                  {outline.sections.map((section, index) => (
                    <li key={index} className={cn(styles.outlineItem, "flex items-start gap-3")}>
                      <span className={styles.outlineNum}>{index + 1}</span>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <label className="sr-only" htmlFor={`ai-sec-${index}`}>
                          Section {index + 1} heading
                        </label>
                        <input id={`ai-sec-${index}`} value={section.heading} onChange={(e) => updateSection(index, e.target.value)} className={styles.outlineInput} />
                        {section.points.length > 0 && <p className="text-xs text-ink-600">{section.points.join(" · ")}</p>}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button type="button" className={styles.iconBtn} onClick={() => moveSection(index, -1)} disabled={index === 0} title="Move up">
                          <Icon name="arrowLeft" size={14} className="rotate-90" />
                          <span className="sr-only">Move section up</span>
                        </button>
                        <button type="button" className={styles.iconBtn} onClick={() => moveSection(index, 1)} disabled={index === outline.sections.length - 1} title="Move down">
                          <Icon name="arrowRight" size={14} className="rotate-90" />
                          <span className="sr-only">Move section down</span>
                        </button>
                        <button type="button" className={styles.iconBtn} onClick={() => removeSection(index)} title="Remove">
                          <Icon name="trash" size={14} />
                          <span className="sr-only">Remove section</span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {tab === "draft" && !busy && draft && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-ink-600">
                  Title: <strong className="text-ink-900">{draft.title}</strong>
                </p>
                <div className={cn(styles.preview, proseStyles.prose)} dangerouslySetInnerHTML={{ __html: draft.html }} />
                <ReviewNote />
              </div>
            )}

            {/* ---------------- Rewrite ---------------- */}
            {tab === "rewrite" && !busy && (
              <div className="flex flex-col gap-4">
                {!selection ? (
                  <Alert tone="info" title="Select some text first">
                    Close this window, highlight a sentence or paragraph in the Visual editor, then press <strong>AI assist</strong> again.
                  </Alert>
                ) : (
                  <>
                    <div>
                      <p className={styles.label}>Selected text</p>
                      <blockquote className={styles.quote}>{selection.text.length > 600 ? `${selection.text.slice(0, 600)}…` : selection.text}</blockquote>
                    </div>
                    {!rewrite && (
                      <fieldset>
                        <legend className={styles.label}>How should it change?</legend>
                        <div className="flex flex-wrap gap-2">
                          {REWRITE_MODES.map((m) => (
                            <button key={m.id} type="button" aria-pressed={rewriteMode === m.id} onClick={() => setRewriteMode(m.id)} className={cn(styles.chip, rewriteMode === m.id && styles.chipActive)}>
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </fieldset>
                    )}
                    {rewrite && (
                      <div>
                        <p className={styles.label}>Suggested rewrite</p>
                        <div className={cn(styles.preview, proseStyles.prose)} dangerouslySetInnerHTML={{ __html: rewrite.html }} />
                        <ReviewNote />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ---------------- Meta ---------------- */}
            {tab === "meta" && !busy && (
              <div className="flex flex-col gap-4">
                {!meta && (
                  <p className="text-sm text-ink-600">
                    The assistant reads the article in the editor and suggests headlines, a summary for the blog listing, and the text Google shows in search results. Write the article first.
                  </p>
                )}
                {meta && (
                  <div className="flex flex-col gap-3">
                    {meta.titles?.length > 0 && (
                      <div className={styles.suggestion}>
                        <p className={styles.label}>Headlines</p>
                        <ul className="flex flex-col gap-2">
                          {meta.titles.map((t) => (
                            <li key={t} className="flex items-center justify-between gap-3">
                              <span>{t}</span>
                              <UseButton applied={applied.title === t} onClick={() => applyMeta("title", t)} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {[
                      ["excerpt", "Excerpt", meta.excerpt],
                      ["seoTitle", "SEO title", meta.seoTitle],
                      ["seoDescription", "Meta description", meta.seoDescription],
                      ["slug", "URL slug", meta.slug],
                    ]
                      .filter(([, , v]) => v)
                      .map(([field, label, value]) => (
                        <div key={field} className={cn(styles.suggestion, "flex items-start justify-between gap-3")}>
                          <div className="min-w-0">
                            <p className={styles.label}>
                              {label} <span className="font-normal text-ink-400">· {value.length} characters</span>
                            </p>
                            <p className={field === "slug" ? "font-mono text-sm" : ""}>{value}</p>
                          </div>
                          <UseButton applied={applied[field] === value} onClick={() => applyMeta(field, value)} />
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

function UseButton({ applied, onClick }) {
  return (
    <button type="button" onClick={onClick} className={cn(styles.use, applied && styles.useDone)} disabled={applied}>
      {applied ? (
        <>
          <Icon name="check" size={14} /> Used
        </>
      ) : (
        "Use"
      )}
    </button>
  );
}
