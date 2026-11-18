import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Button from "@/components/ui/Button/Button";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/constants/routes";
import { useIsActive } from "@/hooks/useIsActive";
import { cn } from "@/utils/cn";
import styles from "./MobileMenu.module.css";

/**
 * Full-screen menu for small screens, built on the native <dialog> element:
 * showModal() gives us focus trapping, Escape-to-close and an inert
 * background without extra libraries.
 *
 * @param {object} props
 * @param {{ label: string, href: string }[]} props.items
 */
export default function MobileMenu({ items, className }) {
  const dialogRef = useRef(null);
  const [open, setOpen] = useState(false);
  const isActive = useIsActive();
  const router = useRouter();
  const phone = siteConfig.contact.phones[0];

  const openMenu = () => {
    dialogRef.current?.showModal();
    setOpen(true);
  };

  // Update state directly as well as closing the dialog: the native "close"
  // event isn't reliably delivered when closing during a route change, which
  // would leave the page scroll-locked.
  const closeMenu = useCallback(() => {
    if (dialogRef.current?.open) dialogRef.current.close();
    setOpen(false);
  }, []);

  // Close when navigation starts, so the next page isn't hidden behind the menu.
  useEffect(() => {
    router.events.on("routeChangeStart", closeMenu);
    return () => router.events.off("routeChangeStart", closeMenu);
  }, [router.events, closeMenu]);

  // Stop the page behind from scrolling while the menu is open.
  useEffect(() => {
    if (!open) return undefined;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className={className}>
      <button
        type="button"
        className={cn(styles.toggle, "inline-flex size-11 items-center justify-center")}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={openMenu}
      >
        <span className="sr-only">Open menu</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <dialog
        id="mobile-menu"
        ref={dialogRef}
        className={styles.dialog}
        aria-label="Menu"
        // The "close" event fires for Escape, the close button and programmatic close.
        onClose={() => setOpen(false)}
      >
        <div className="flex min-h-full flex-col px-[var(--gutter)] pb-8">
          <div className="flex h-[var(--header-height)] items-center justify-end pt-1">
            <button
              type="button"
              className={cn(styles.toggle, "inline-flex size-11 items-center justify-center")}
              onClick={closeMenu}
              autoFocus
            >
              <span className="sr-only">Close menu</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav aria-label="Main" className="mt-4">
            <ul className="flex flex-col">
              {[{ label: "Home", href: ROUTES.home }, ...items].map((item, index) => {
                const active = isActive(item.href);
                return (
                  <li
                    key={item.href}
                    className={styles.item}
                    style={{ "--i": index }}
                  >
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      aria-current={active ? "page" : undefined}
                      className={cn(styles.link, active && styles.active, "flex items-center justify-between py-3")}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto flex flex-col gap-6 pt-10">
            <Button href={ROUTES.apply} size="lg" withArrow onClick={closeMenu}>
              Apply now
            </Button>
            <dl className="grid gap-4 text-sm">
              <div>
                <dt className="text-ink-600">Call us</dt>
                <dd>
                  <a href={`tel:${phone.tel}`} className="font-medium">
                    {phone.display}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-ink-600">Email</dt>
                <dd>
                  <a href={`mailto:${siteConfig.contact.email}`} className="font-medium break-all">
                    {siteConfig.contact.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </dialog>
    </div>
  );
}
