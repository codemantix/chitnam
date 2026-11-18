import { cn } from "@/utils/cn";
import styles from "./CheckList.module.css";

/**
 * Bulleted list with a green tick before each item.
 *
 * @param {object} props
 * @param {string[]} props.items
 * @param {1|2} [props.columns=1] Two columns from the medium breakpoint.
 */
export default function CheckList({ items, columns = 1, className }) {
  return (
    <ul className={cn("grid gap-x-10 gap-y-4", columns === 2 && "md:grid-cols-2", className)}>
      {items.map((item) => (
        <li key={item} className={cn(styles.item, "relative pl-8 text-ink-700")}>
          {item}
        </li>
      ))}
    </ul>
  );
}
