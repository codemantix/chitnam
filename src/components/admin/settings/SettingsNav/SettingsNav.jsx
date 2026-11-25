import Link from "next/link";
import Icon from "@/components/ui/Icon/Icon";
import { cn } from "@/utils/cn";
import styles from "./SettingsNav.module.css";

export const SETTINGS_SECTIONS = [
  { id: "profile", label: "Profile", icon: "user", group: "Your account" },
  { id: "security", label: "Password & security", icon: "shield", group: "Your account" },
  { id: "business", label: "Business details", icon: "building", group: "Organisation", adminOnly: true },
  { id: "blog", label: "Blog", icon: "posts", group: "Organisation", adminOnly: true },
  { id: "enquiries", label: "Enquiries", icon: "inbox", group: "Organisation", adminOnly: true },
];

/** Left-hand navigation for /admin/settings/ (a scrolling strip on phones). */
export default function SettingsNav({ active, isAdmin }) {
  const sections = SETTINGS_SECTIONS.filter((s) => isAdmin || !s.adminOnly);
  const groups = [...new Set(sections.map((s) => s.group))];
  return (
    <nav aria-label="Settings sections" className={styles.nav}>
      {groups.map((group) => (
        <div key={group} className={styles.group}>
          <p className={styles.groupLabel}>{group}</p>
          <ul className={styles.list}>
            {sections
              .filter((s) => s.group === group)
              .map((s) => (
                <li key={s.id}>
                  <Link href={`/admin/settings/?section=${s.id}`} scroll={false} aria-current={active === s.id ? "page" : undefined} className={cn(styles.link, active === s.id && styles.active)}>
                    <Icon name={s.icon} size={18} />
                    {s.label}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
