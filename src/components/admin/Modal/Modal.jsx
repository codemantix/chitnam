import { useEffect, useId, useRef } from "react";
import Icon from "@/components/ui/Icon/Icon";
import { cn } from "@/utils/cn";
import styles from "./Modal.module.css";

/**
 * Accessible modal built on <dialog>: focus is trapped, Escape closes it,
 * the page behind is inert. Clicking the backdrop also closes it.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} props.title
 * @param {"sm"|"md"|"xl"} [props.size="md"]
 * @param {React.ReactNode} [props.footer]
 */
export default function Modal({ open, onClose, title, size = "md", footer, children }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // <dialog> focuses its first focusable element (the close button);
      // move focus to the field marked data-autofocus instead, if any.
      dialog.querySelector("[data-autofocus]")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={cn(styles.dialog, styles[size])}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className={styles.panel}>
          <header className={cn(styles.header, "flex items-center justify-between gap-4")}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            <button type="button" onClick={onClose} className={styles.close}>
              <Icon name="close" size={18} />
              <span className="sr-only">Close</span>
            </button>
          </header>
          <div className={styles.body}>{children}</div>
          {footer && <footer className={cn(styles.footer, "flex flex-wrap items-center justify-end gap-3")}>{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}
