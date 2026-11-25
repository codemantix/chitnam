import { useId } from "react";
import { cn } from "@/utils/cn";
import styles from "./Toggle.module.css";

/** Accessible on/off switch (a checkbox with role="switch"). */
export default function Toggle({ checked, onChange, label, description, disabled }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-[0.9375rem] font-semibold text-ink-900">
          {label}
        </label>
        {description && (
          <p id={`${id}-desc`} className="mt-0.5 text-[0.8125rem] leading-normal text-ink-600">
            {description}
          </p>
        )}
      </div>
      <span className={cn(styles.track, checked && styles.on)}>
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          aria-describedby={description ? `${id}-desc` : undefined}
          className={styles.input}
        />
        <span className={styles.thumb} aria-hidden="true" />
      </span>
    </div>
  );
}
