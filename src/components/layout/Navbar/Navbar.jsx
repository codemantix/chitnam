import Link from "next/link";
import { useIsActive } from "@/hooks/useIsActive";
import { cn } from "@/utils/cn";
import styles from "./Navbar.module.css";

/**
 * Desktop navigation links. The mobile equivalent is MobileMenu.
 *
 * @param {object} props
 * @param {{ label: string, href: string }[]} props.items
 */
export default function Navbar({ items, className }) {
  const isActive = useIsActive();

  return (
    <nav aria-label="Main" className={className}>
      <ul className="flex items-center gap-7 xl:gap-9">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(styles.link, active && styles.active)}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
