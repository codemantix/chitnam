import { cn } from "@/utils/cn";
import styles from "./Field.module.css";

/**
 * Labelled form control with hint and error text.
 *
 * - Renders <input>, <select> or <textarea> depending on `as`.
 * - Error and hint are linked with aria-describedby; aria-invalid is set
 *   when there's an error, so screen readers announce it on focus.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {"input"|"select"|"textarea"} [props.as="input"]
 * @param {string} [props.hint]
 * @param {string} [props.error]
 * @param {boolean} [props.required]
 * @param {{ value: string, label: string }[]} [props.options] For selects.
 * @param {string} [props.placeholderOption] First, empty option for selects.
 */
export default function Field({
  id,
  label,
  as = "input",
  hint,
  error,
  required = false,
  options = [],
  placeholderOption = "Select an option",
  className,
  ...rest
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const controlProps = {
    id,
    name: rest.name || id,
    required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: cn(styles.control, as === "textarea" && styles.textarea, as === "select" && styles.select, error && styles.invalid),
    ...rest,
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            {" "}*
          </span>
        ) : (
          <span className="font-normal text-ink-600"> (optional)</span>
        )}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-ink-600">
          {hint}
        </p>
      )}

      {as === "select" ? (
        <select {...controlProps}>
          <option value="">{placeholderOption}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : as === "textarea" ? (
        <textarea rows={5} {...controlProps} />
      ) : (
        <input {...controlProps} />
      )}

      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Checkbox with a label that can contain links (e.g. privacy policy).
 */
export function CheckboxField({ id, label, error, required = false, className, ...rest }) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id={id}
          name={rest.name || id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(styles.checkbox, error && styles.invalid)}
          {...rest}
        />
        <label htmlFor={id} className="text-sm text-ink-700">
          {label}
        </label>
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
