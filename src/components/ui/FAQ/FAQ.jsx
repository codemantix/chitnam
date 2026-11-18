import { cn } from "@/utils/cn";
import styles from "./FAQ.module.css";

/**
 * Accessible FAQ list using native <details>/<summary>: keyboard and
 * screen-reader support with no JavaScript, and answers stay in the HTML
 * for search engines. Pair with faqSchema() for structured data.
 *
 * @param {object} props
 * @param {{ question: string, answer: string }[]} props.items
 * @param {"h3"|"h4"} [props.headingLevel="h3"]
 */
export default function FAQ({ items, headingLevel: Heading = "h3", className }) {
  if (!items?.length) return null;

  return (
    <div className={cn(styles.list, className)}>
      {items.map((item) => (
        <details key={item.question} className={styles.item}>
          <summary className={cn(styles.summary, "flex items-start justify-between gap-6 py-5")}>
            <Heading className={styles.question}>{item.question}</Heading>
            <span className={styles.icon} aria-hidden="true" />
          </summary>
          <div className={cn(styles.answer, "pb-6 pr-10 text-ink-700")}>
            <p>{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
