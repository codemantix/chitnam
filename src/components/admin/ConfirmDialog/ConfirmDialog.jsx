import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import Icon from "@/components/ui/Icon/Icon";
import { cn } from "@/utils/cn";
import styles from "./ConfirmDialog.module.css";

/**
 * Designed replacement for window.confirm() in the admin area.
 *
 *   const confirm = useConfirm();
 *   if (!(await confirm({ title: "Delete category?", tone: "danger", confirmLabel: "Delete" }))) return;
 *
 * - Built on <dialog>: focus is trapped, the page behind is inert.
 * - Escape, the backdrop or Cancel resolve false; the confirm button resolves true.
 * - Destructive dialogs focus Cancel first, so a stray Enter never deletes anything.
 */

const ConfirmContext = createContext(null);

const TONES = {
  danger: { icon: "trash", className: "danger" },
  warning: { icon: "shield", className: "warning" },
  default: { icon: "check", className: "neutral" },
};

/**
 * @typedef {object} ConfirmOptions
 * @property {string} title
 * @property {React.ReactNode} [message]
 * @property {string[]} [details] Bullet points of what will happen.
 * @property {string} [confirmLabel="Confirm"]
 * @property {string} [cancelLabel="Cancel"]
 * @property {"danger"|"warning"|"default"} [tone="default"]
 * @property {string} [icon] Overrides the tone's icon.
 */

export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null); // { options, resolve }

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        setRequest({ options, resolve });
      }),
    []
  );

  const settle = (value) => {
    request?.resolve(value);
    setRequest(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request && <ConfirmDialog options={request.options} onSettle={settle} />}
    </ConfirmContext.Provider>
  );
}

/** Returns confirm(options) → Promise<boolean>. Falls back to window.confirm outside the provider. */
export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  return confirm || ((options) => Promise.resolve(window.confirm([options.title, options.message].filter((t) => typeof t === "string").join("\n\n"))));
}

function ConfirmDialog({ options, onSettle }) {
  const ref = useRef(null);
  const cancelRef = useRef(null);
  const confirmRef = useRef(null);
  const titleId = useId();
  const descId = useId();
  const tone = TONES[options.tone] || TONES.default;
  const destructive = options.tone === "danger";

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    (destructive ? cancelRef : confirmRef).current?.focus();
  }, [destructive]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={options.message || options.details ? descId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onSettle(false);
      }}
      onClick={(event) => {
        if (event.target === ref.current) onSettle(false);
      }}
    >
      <div className={styles.body}>
        <span className={cn(styles.icon, styles[tone.className])} aria-hidden="true">
          <Icon name={options.icon || tone.icon} size={22} />
        </span>
        <div className="flex min-w-0 flex-col gap-2">
          <h2 id={titleId} className={styles.title}>
            {options.title}
          </h2>
          <div id={descId} className="flex flex-col gap-3">
            {options.message && <p className={styles.message}>{options.message}</p>}
            {options.details?.length > 0 && (
              <ul className={cn(styles.details, styles[`details_${tone.className}`])}>
                {options.details.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <div className={styles.actions}>
        <button ref={cancelRef} type="button" className={styles.cancel} onClick={() => onSettle(false)}>
          {options.cancelLabel || "Cancel"}
        </button>
        <button ref={confirmRef} type="button" className={cn(styles.confirm, styles[`confirm_${tone.className}`])} onClick={() => onSettle(true)}>
          {options.confirmLabel || "Confirm"}
        </button>
      </div>
    </dialog>
  );
}
