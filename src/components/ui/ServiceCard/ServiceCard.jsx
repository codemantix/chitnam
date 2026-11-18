import Link from "next/link";
import Icon from "@/components/ui/Icon/Icon";
import { cn } from "@/utils/cn";
import styles from "./ServiceCard.module.css";

/**
 * Service card in the style of the original site: line icon, centred title
 * and summary, soft shadow. The whole card is clickable via the title link.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.summary
 * @param {string} props.href
 * @param {string} [props.icon] Icon name (see ui/Icon).
 * @param {"h2"|"h3"} [props.headingLevel="h3"]
 */
export default function ServiceCard({ title, summary, href, icon, headingLevel: Heading = "h3", className }) {
  return (
    <article className={cn(styles.card, "relative flex h-full flex-col items-center gap-4 text-center", className)}>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          <Icon name={icon} size={34} strokeWidth={1.5} />
        </span>
      )}
      <Heading className={styles.title}>
        <Link href={href} className={styles.link}>
          {title}
        </Link>
      </Heading>
      <p className="text-[0.9375rem] leading-relaxed text-ink-600">{summary}</p>
      <span className={cn(styles.more, "mt-auto inline-flex items-center gap-1.5 text-sm font-semibold")} aria-hidden="true">
        Learn more
        <Icon name="arrowRight" size={16} />
      </span>
    </article>
  );
}
