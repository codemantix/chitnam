import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button/Button";
import Container from "@/components/ui/Container/Container";
import Icon from "@/components/ui/Icon/Icon";
import { formatAddress, mapsUrl, siteConfig, socialLinks } from "@/config/site";
import { LEGAL_NAV, ROUTES } from "@/constants/routes";
import { services } from "@/data/services";
import { cn } from "@/utils/cn";
import styles from "./Footer.module.css";

const QUICK_LINKS = [
  { label: "Home", href: ROUTES.home },
  { label: "About us", href: ROUTES.about },
  { label: "Our services", href: ROUTES.services },
  { label: "Partners", href: ROUTES.partners },
  { label: "Blog", href: ROUTES.blog },
  { label: "Contact", href: ROUTES.contact },
];

function LinkList({ links }) {
  return (
    <ul className="flex flex-col gap-3">
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className={styles.link}>
            <Icon name="chevronRight" size={14} className={styles.chevron} />
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Dark footer in the style of the original site. */
export default function Footer() {
  const { contact } = siteConfig;

  return (
    <footer className={styles.footer}>
      <Container className="flex flex-col gap-12 pt-16 pb-8 md:pt-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.1fr_1.3fr] lg:gap-10">
          <div className="flex flex-col items-start gap-6">
            <Link href={ROUTES.home} aria-label={`${siteConfig.name}, home`} className={styles.logoPlate}>
              <Image src={siteConfig.logo.src} alt="" width={138} height={52} />
            </Link>
            <p className={styles.muted}>
              An education placement agency in Port Harcourt, helping students study abroad since{" "}
              {siteConfig.foundingYear}: course counselling, admissions, student visas and pre-departure support.
            </p>
            <Button href={ROUTES.about} size="md" className={styles.readMore}>
              About us
            </Button>
          </div>

          <div className="flex flex-col gap-5">
            <h2 className={styles.title}>Quick links</h2>
            <LinkList links={QUICK_LINKS} />
          </div>

          <div className="flex flex-col gap-5">
            <h2 className={styles.title}>Services</h2>
            <LinkList links={services.map((s) => ({ label: s.title, href: ROUTES.service(s.slug) }))} />
          </div>

          <div className="flex flex-col gap-5">
            <h2 className={styles.title}>Contact info</h2>
            <address className="flex flex-col gap-5 not-italic">
              <a href={mapsUrl()} target="_blank" rel="noopener noreferrer" className={cn(styles.contactRow, styles.link)}>
                <Icon name="pin" size={20} className={styles.contactIcon} />
                <span>
                  {formatAddress()}
                  <span className="sr-only"> (opens Google Maps in a new tab)</span>
                </span>
              </a>
              <div className={styles.contactRow}>
                <Icon name="phone" size={20} className={styles.contactIcon} />
                <ul className="flex flex-col gap-1">
                  {contact.phones.map((phone) => (
                    <li key={phone.tel}>
                      <a href={`tel:${phone.tel}`} className={styles.link}>
                        {phone.display}
                        {phone.label && ` (${phone.label})`}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <a href={`mailto:${contact.email}`} className={cn(styles.contactRow, styles.link)}>
                <Icon name="mail" size={20} className={styles.contactIcon} />
                <span className="break-all">{contact.email}</span>
              </a>
            </address>
          </div>
        </div>

        <div className={cn(styles.bottom, "flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between")}>
          <p className={styles.small} suppressHydrationWarning>
            © {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <ul className="flex gap-6">
              {LEGAL_NAV.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={cn(styles.link, styles.small)}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {socialLinks.length > 0 && (
              <ul className="flex gap-2.5" aria-label="Social media">
                {socialLinks.map((link) => (
                  <li key={link.key}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className={styles.social}>
                      <Icon name={link.key} size={18} />
                      <span className="sr-only">
                        {siteConfig.name} on {link.label} (opens in a new tab)
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Container>
    </footer>
  );
}
