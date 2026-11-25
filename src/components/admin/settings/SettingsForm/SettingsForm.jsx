import { useEffect, useState } from "react";
import Alert from "@/components/ui/Alert/Alert";
import Button from "@/components/ui/Button/Button";
import { cn } from "@/utils/cn";
import styles from "./SettingsForm.module.css";

/**
 * One settings section: a card with a header, rows of fields and a save bar
 * that appears when something has changed (Discard / Save changes).
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {boolean} props.dirty Whether the form differs from what's saved.
 * @param {() => Promise<string|void>} props.onSave Resolves with a success message, throws to show an error.
 * @param {() => void} props.onDiscard
 * @param {string} [props.saveLabel="Save changes"]
 */
export default function SettingsForm({ title, description, dirty, onSave, onDiscard, saveLabel = "Save changes", children }) {
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  // Warn before leaving the page with unsaved changes.
  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const message = await onSave();
      setNotice({ tone: "success", text: message || "Changes saved." });
    } catch (error) {
      setNotice({ tone: "error", text: error.message || "Something went wrong. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form method="post" onSubmit={submit} noValidate className={styles.card}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
      </header>
      {notice && (
        <div className="px-6 pt-5">
          <Alert tone={notice.tone} title={notice.text} />
        </div>
      )}
      <div className={styles.body}>{children}</div>
      <footer className={cn(styles.footer, dirty && styles.footerDirty)}>
        <span className={styles.footerNote} aria-live="polite">
          {dirty ? "You have unsaved changes" : "All changes saved"}
        </span>
        <div className="flex gap-2">
          {dirty && (
            <Button type="button" variant="ghost" onClick={onDiscard} disabled={saving}>
              Discard
            </Button>
          )}
          <Button type="submit" loading={saving} disabled={!dirty || saving}>
            {saveLabel}
          </Button>
        </div>
      </footer>
    </form>
  );
}

/** A labelled row: label and help text on the left, the control on the right. */
export function SettingsRow({ label, htmlFor, help, children, stacked = false }) {
  return (
    <div className={cn(styles.row, stacked && styles.rowStacked)}>
      <div className={styles.rowLabel}>
        {htmlFor ? (
          <label htmlFor={htmlFor} className={styles.label}>
            {label}
          </label>
        ) : (
          <p className={styles.label}>{label}</p>
        )}
        {help && <p className={styles.help}>{help}</p>}
      </div>
      <div className={styles.rowControl}>{children}</div>
    </div>
  );
}

/** Plain text input styled for settings. */
export function SettingsInput({ invalid, className, ...props }) {
  return <input className={cn(styles.input, invalid && styles.invalid, className)} aria-invalid={invalid || undefined} {...props} />;
}

export function SettingsError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className={styles.error}>
      {children}
    </p>
  );
}

/** JSON request helper used by the settings sections. */
export async function settingsRequest(url, method, body) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);
  if (!response) throw new Error("We couldn't reach the server. Check your connection and try again.");
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Settings couldn't be saved.");
    error.fields = data.errors || {};
    throw error;
  }
  return data;
}
