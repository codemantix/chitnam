import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Icon from "@/components/ui/Icon/Icon";
import Alert from "@/components/ui/Alert/Alert";
import { siteConfig } from "@/config/site";
import { getBrowserClient } from "@/lib/supabase/browserClient";
import { cn } from "@/utils/cn";
import styles from "./AdminLayout.module.css";

const NAV = [
  { label: "Dashboard", href: "/admin/", icon: "dashboard", exact: true },
  { label: "Posts", href: "/admin/posts/", icon: "posts" },
  { label: "Enquiries", href: "/admin/enquiries/", icon: "inbox", countKey: "newEnquiries" },
];

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "S";

/**
 * Shell for the staff area: floating sidebar on desktop, pill navigation on
 * small screens, soft rounded surfaces. Never indexed.
 *
 * @param {object} props
 * @param {string} props.title Page title (also the h1).
 * @param {string} [props.eyebrow] Small text above the title.
 * @param {{ name: string, role: string }|null} [props.staff]
 * @param {boolean} [props.notConfigured]
 * @param {React.ReactNode} [props.actions] Buttons beside the title.
 * @param {{ newEnquiries?: number }} [props.counts] Badges in the navigation.
 */
export default function AdminLayout({ title, eyebrow, staff, notConfigured, actions, counts = {}, children }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const path = router.asPath.split(/[?#]/)[0];
  const isActive = (item) => (item.exact ? path === item.href : path.startsWith(item.href));

  const signOut = async () => {
    setSigningOut(true);
    await getBrowserClient()?.auth.signOut();
    router.replace("/admin/login/");
  };

  return (
    <div className={styles.shell}>
      <Head>
        <title>{`${title} · Chitnam admin`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-xl focus:bg-ink-900 focus:p-3 focus:text-white"
      >
        Skip to content
      </a>

      {/* ---------- Desktop sidebar ---------- */}
      <aside className={styles.sidebar} aria-label="Admin">
        <Link href="/admin/" className={styles.brand} aria-label="Admin dashboard">
          <Image src={siteConfig.logo.src} alt="" width={106} height={40} />
          <span className={styles.badge}>Admin</span>
        </Link>

        {staff && (
          <nav aria-label="Admin sections" className="flex flex-col gap-1">
            <p className={cn(styles.navLabel, "mb-1")}>Manage</p>
            {NAV.map((item) => {
              const active = isActive(item);
              const count = item.countKey ? counts[item.countKey] : 0;
              return (
                <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn(styles.navLink, active && styles.navActive)}>
                  <Icon name={item.icon} />
                  {item.label}
                  {count > 0 && (
                    <span className={styles.count}>
                      {count}
                      <span className="sr-only"> new</span>
                    </span>
                  )}
                </Link>
              );
            })}
            <p className={cn(styles.navLabel, "mt-5 mb-1")}>Website</p>
            <Link href="/" target="_blank" rel="noopener noreferrer" className={styles.navLink}>
              <Icon name="globe" />
              View site
              <Icon name="external" size={16} className="ml-auto text-ink-400" />
              <span className="sr-only">(opens in a new tab)</span>
            </Link>
          </nav>
        )}

        {staff && (
          <div className={cn(styles.userCard, "mt-auto")}>
            <span className={styles.avatar} aria-hidden="true">
              {initials(staff.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{staff.name}</p>
              <p className="text-xs capitalize text-ink-600">{staff.role}</p>
            </div>
            <button type="button" onClick={signOut} disabled={signingOut} className={styles.iconButton} title="Sign out">
              <Icon name="logout" size={18} />
              <span className="sr-only">{signingOut ? "Signing out" : "Sign out"}</span>
            </button>
          </div>
        )}
      </aside>

      {/* ---------- Mobile top bar ---------- */}
      <header className={styles.topbar}>
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <Link href="/admin/" className={styles.brand} aria-label="Admin dashboard">
            <Image src={siteConfig.logo.src} alt="" width={90} height={34} />
            <span className={styles.badge}>Admin</span>
          </Link>
          {staff && (
            <button type="button" onClick={signOut} disabled={signingOut} className={cn(styles.iconButton, "bg-[var(--admin-muted)]")} title="Sign out">
              <Icon name="logout" size={18} />
              <span className="sr-only">Sign out</span>
            </button>
          )}
        </div>
        {staff && (
          <nav aria-label="Admin sections" className={cn(styles.mobileNav, "flex gap-2 overflow-x-auto px-4 pb-3")}>
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} aria-current={isActive(item) ? "page" : undefined} className={cn(styles.mobileLink, isActive(item) && styles.mobileActive)}>
                <Icon name={item.icon} size={16} />
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* ---------- Content ---------- */}
      <main id="admin-main" className={styles.main}>
        <div className={cn(styles.inner, "flex flex-col gap-7")}>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex min-w-0 flex-col gap-1">
              {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
              <h1 className={styles.title}>{title}</h1>
            </div>
            {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
          </div>

          {notConfigured ? (
            <Alert tone="warning" title="Supabase isn't connected yet">
              Set <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and{" "}
              <code>SUPABASE_SERVICE_ROLE_KEY</code>, run the SQL in <code>supabase/migrations</code>, then reload. See the
              README for the full steps.
            </Alert>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}
