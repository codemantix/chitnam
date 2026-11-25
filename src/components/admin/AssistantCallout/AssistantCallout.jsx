import Link from "next/link";
import Icon from "@/components/ui/Icon/Icon";
import { cn } from "@/utils/cn";
import styles from "./AssistantCallout.module.css";

/** Dashboard banner pointing staff to the Gemini writing assistant. */
export default function AssistantCallout() {
  return (
    <section className={cn(styles.callout, "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between")} aria-labelledby="assistant-callout">
      <div className="flex items-start gap-4">
        <span className={styles.icon} aria-hidden="true">
          <Icon name="sparkle" size={22} />
        </span>
        <div className="flex flex-col gap-1">
          <h2 id="assistant-callout" className={styles.title}>
            Write faster with the AI assistant
          </h2>
          <p className={styles.text}>
            Turn a topic into an outline and a first draft, rewrite paragraphs, or get headline and SEO ideas. Always
            check the facts before you publish.
          </p>
        </div>
      </div>
      <Link href="/admin/posts/new/" className={styles.button}>
        Start a post <Icon name="arrowRight" size={16} />
      </Link>
    </section>
  );
}
