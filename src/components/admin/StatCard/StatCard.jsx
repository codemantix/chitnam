import Link from "next/link";
import Icon from "@/components/ui/Icon/Icon";
import { cn } from "@/utils/cn";
import styles from "./StatCard.module.css";

const TONES = { green: styles.green, amber: styles.amber, slate: styles.slate, blue: styles.blue };
const CARD_TONES = { green: styles.cardGreen, amber: styles.cardAmber, slate: styles.cardSlate, blue: styles.cardBlue };

/**
 * Dashboard figure with an icon, linking to the filtered list.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {number} props.value
 * @param {string} props.href
 * @param {string} props.icon
 * @param {"green"|"amber"|"slate"|"blue"} [props.tone="green"]
 * @param {string} [props.hint]
 */
export default function StatCard({ label, value, href, icon, tone = "green", hint }) {
  return (
    <Link href={href} className={cn(styles.card, CARD_TONES[tone], "flex items-start justify-between gap-4 p-6")}>
      <span className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-700">{label}</span>
        <span className={styles.value}>{value.toLocaleString("en-GB")}</span>
        {hint && <span className="text-xs text-ink-600">{hint}</span>}
      </span>
      <span className={cn(styles.icon, TONES[tone])} aria-hidden="true">
        <Icon name={icon} size={22} />
      </span>
    </Link>
  );
}
