import Image from "next/image";
import Link from "next/link";
import MobileMenu from "@/components/layout/MobileMenu/MobileMenu";
import Navbar from "@/components/layout/Navbar/Navbar";
import Button from "@/components/ui/Button/Button";
import Container from "@/components/ui/Container/Container";
import { siteConfig } from "@/config/site";
import { MAIN_NAV, ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";
import styles from "./Header.module.css";

const LOGO_HEIGHT = 52;
const LOGO_WIDTH = Math.round((siteConfig.logo.width / siteConfig.logo.height) * LOGO_HEIGHT);

/** White header bar: logo, navigation and the Apply now button. */
export default function Header() {
  return (
    <header className={cn(styles.header, "sticky top-0 z-40")}>
      <Container className="flex h-[var(--header-height)] items-center justify-between gap-6">
        <Link href={ROUTES.home} className="shrink-0" aria-label={`${siteConfig.name}, home`}>
          <Image src={siteConfig.logo.src} alt="" width={LOGO_WIDTH} height={LOGO_HEIGHT} loading="eager" />
        </Link>

        <Navbar items={MAIN_NAV} className="hidden lg:block" />

        <div className="flex items-center gap-3">
          {/* Wrapper controls visibility: the Button's own inline-flex would override `hidden`. */}
          <span className="hidden sm:block">
            <Button href={ROUTES.apply} className={styles.apply}>
              Apply now
            </Button>
          </span>
          <MobileMenu items={MAIN_NAV} className="lg:hidden" />
        </div>
      </Container>
    </header>
  );
}
