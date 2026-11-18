import { cn } from "@/utils/cn";
import styles from "./AuthorBox.module.css";

/**
 * Byline box at the end of an article.
 *
 * @param {object} props
 * @param {{ name: string, role?: string|null, bio?: string|null }} props.author
 */
export default function AuthorBox({ author }) {
  if (!author) return null;
  const initials = author.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <aside aria-label="About the author" className={cn(styles.box, "flex gap-5 p-6")}>
      <span className={styles.avatar} aria-hidden="true">
        {initials}
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-ink-600">Written by</p>
        <p className="font-medium text-ink-900">{author.name}</p>
        {author.role && <p className="text-sm text-ink-600">{author.role}</p>}
        {author.bio && <p className="mt-2 text-sm text-ink-700">{author.bio}</p>}
      </div>
    </aside>
  );
}
