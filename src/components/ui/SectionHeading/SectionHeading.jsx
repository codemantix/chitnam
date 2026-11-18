import { cn } from "@/utils/cn";
import styles from "./SectionHeading.module.css";

/**
 * Eyebrow + heading + optional lead paragraph.
 *
 * @param {object} props
 * @param {string} [props.eyebrow] Small label above the heading.
 * @param {React.ReactNode} props.title
 * @param {React.ReactNode} [props.lead]
 * @param {"h1"|"h2"|"h3"} [props.as="h2"] Keep heading levels in order on each page.
 * @param {"start"|"center"} [props.align="start"]
 * @param {string} [props.id] Put on the heading so sections can use aria-labelledby.
 */
export default function SectionHeading({
  eyebrow,
  title,
  lead,
  as: Heading = "h2",
  align = "start",
  id,
  className,
}) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        centered && "mx-auto items-center text-center",
        styles.wrapper,
        className
      )}
    >
      {eyebrow && (
        <p className={cn(styles.eyebrow, centered && styles.eyebrowCentered)}>
          {eyebrow}
        </p>
      )}
      <Heading
        id={id}
        className={Heading === "h1" ? styles.titleLarge : styles.title}
      >
        {title}
      </Heading>
      {lead && <p className={cn(styles.lead, "text-ink-600")}>{lead}</p>}
    </div>
  );
}
