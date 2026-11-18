import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/Icon/Icon";
import { siteConfig } from "@/config/site";
import adminStyles from "@/components/admin/AdminLayout/AdminLayout.module.css";
import { cn } from "@/utils/cn";
import styles from "./AuthLayout.module.css";

/**
 * Centred card layout for the staff sign-in page.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 */
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className={cn(adminStyles.shell, styles.page)}>
      <Head>
        <title>{`${title} · Chitnam admin`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="flex w-full max-w-md flex-col items-center gap-8">
          <Link href="/" aria-label={`${siteConfig.name} website`}>
            <Image src={siteConfig.logo.src} alt="" width={148} height={56} priority />
          </Link>
          <div className={cn(styles.card, "w-full")}>
            <div className="mb-7 flex flex-col items-center gap-3 text-center">
              <span className={styles.lock} aria-hidden="true">
                <Icon name="lock" size={22} />
              </span>
              <h1 className={styles.title}>{title}</h1>
              {subtitle && <p className="text-sm text-ink-600">{subtitle}</p>}
            </div>
            {children}
          </div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink-600 no-underline hover:text-brand-700">
            <Icon name="arrowLeft" size={16} />
            Back to the website
          </Link>
        </div>
      </main>
    </div>
  );
}
