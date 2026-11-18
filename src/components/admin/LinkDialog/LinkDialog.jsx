import { useState } from "react";
import Modal from "@/components/admin/Modal/Modal";
import Field, { CheckboxField } from "@/components/forms/Field/Field";
import Button from "@/components/ui/Button/Button";

/** Adds https:// to bare domains; leaves site paths, anchors, mailto: and tel: alone. */
export function normaliseUrl(input) {
  const url = input.trim();
  if (!url) return "";
  if (/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(url)) return url;
  if (/^[\w.-]+\.[a-z]{2,}([/?#].*)?$/i.test(url)) return `https://${url}`;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)) return `mailto:${url}`;
  return null;
}

function LinkForm({ initialHref, initialNewTab, onSubmit, onClose }) {
  const [href, setHref] = useState(initialHref);
  const [newTab, setNewTab] = useState(initialNewTab);
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const url = normaliseUrl(href);
    if (url === null) {
      setError("Enter a full web address (e.g. https://www.studyaustralia.gov.au), a page on this site (e.g. /apply-now/), or an email.");
      return;
    }
    onSubmit({ href: url, newTab });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <Field
        id="link-url"
        label="URL"
        required
        data-autofocus
        placeholder="https://"
        hint="Use /apply-now/ style paths for pages on this website."
        value={href}
        onChange={(event) => {
          setHref(event.target.value);
          setError("");
        }}
        error={error}
      />
      <CheckboxField id="link-new-tab" label="Open link in a new tab" checked={newTab} onChange={(event) => setNewTab(event.target.checked)} />
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {initialHref ? (
          <button type="button" className="text-sm font-medium text-error-700 hover:underline" onClick={() => onSubmit({ href: "" })}>
            Remove link
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{initialHref ? "Update link" : "Add link"}</Button>
        </div>
      </div>
    </form>
  );
}

/**
 * "Insert/edit link" dialog for the Classic editor.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} props.initialHref
 * @param {boolean} props.initialNewTab
 * @param {(link: { href: string, newTab?: boolean }) => void} props.onSubmit Empty href removes the link.
 */
export default function LinkDialog({ open, onClose, initialHref, initialNewTab, onSubmit }) {
  return (
    <Modal open={open} onClose={onClose} title={initialHref ? "Edit link" : "Insert link"} size="sm">
      {/* Mounted only while open, so it always starts from the current link. */}
      <LinkForm initialHref={initialHref} initialNewTab={initialNewTab} onSubmit={onSubmit} onClose={onClose} />
    </Modal>
  );
}
