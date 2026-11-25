import { cn } from "@/utils/cn";
import styles from "./Card.module.css";

/**
 * Rounded white surface for admin content, with an optional header.
 *
 * @param {object} props
 * @param {React.ReactNode} [props.title]
 * @param {React.ReactNode} [props.description]
 * @param {React.ReactNode} [props.actions] Right side of the header.
 * @param {"none"|"md"|"lg"} [props.padding="md"]
 * @param {"section"|"div"|"fieldset"} [props.as="section"]
 */
export default function Card({ title, description, actions, padding = "md", as: Tag = "section", className, bodyClassName, children, ...rest }) {
  const headingId = rest.id ? `${rest.id}-title` : undefined;
  return (
    <Tag className={cn(styles.card, className)} aria-labelledby={title && headingId ? headingId : undefined} {...rest}>
      {(title || actions) && (
        <header className={cn(styles.header, "flex items-start justify-between gap-4")}>
          <div className="flex min-w-0 flex-col gap-0.5">
            {title && (
              <h2 id={headingId} className={styles.title}>
                {title}
              </h2>
            )}
            {description && <p className="text-sm text-ink-600">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn(padding === "none" ? "" : padding === "lg" ? "p-7 md:p-9" : "p-6", bodyClassName)}>{children}</div>
    </Tag>
  );
}
