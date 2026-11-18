import Link from "next/link";
import { cn } from "@/utils/cn";
import styles from "./Breadcrumb.module.css";

/**
 * Visible breadcrumb trail. The last item is the current page and is not a link.
 * For structured data, pass the same items to breadcrumbSchema() in utils/schema.js.
 *
 * @param {object} props
 * @param {{ label: string, href: string }[]} props.items First item should be Home.
 */
export default function Breadcrumb({ items, className }) {
  if (!items?.length) return null;
  const lastIndex = items.length - 1;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className={cn(styles.list, "flex flex-wrap items-center text-sm text-ink-600")}>
        {items.map((item, index) => (
          <li key={item.href} className={styles.item}>
            {index === lastIndex ? (
              <span aria-current="page" className="text-ink-900">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className={styles.link}>
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
