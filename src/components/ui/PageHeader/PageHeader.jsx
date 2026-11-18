import Image from "next/image";
import Breadcrumb from "@/components/ui/Breadcrumb/Breadcrumb";
import Container from "@/components/ui/Container/Container";
import { cn } from "@/utils/cn";
import styles from "./PageHeader.module.css";

const DEFAULT_IMAGE = { src: "/images/photos/team-consultation-desk.jpg", position: "50% 45%" };

/**
 * Photographic page banner, in the style of the original site: full-width
 * photo with a dark overlay, centred white title, breadcrumb, and optional
 * lead text and actions. The photo is decorative (the h1 carries the
 * meaning) and loads with high priority as the page's LCP image.
 *
 * @param {object} props
 * @param {{ label: string, href: string }[]} props.breadcrumbs
 * @param {React.ReactNode} props.title Rendered as the page's only h1.
 * @param {string} [props.eyebrow]
 * @param {React.ReactNode} [props.lead]
 * @param {React.ReactNode} [props.children] Actions, e.g. buttons.
 * @param {{ src: string, position?: string }} [props.image]
 */
export default function PageHeader({ breadcrumbs, eyebrow, title, lead, children, image = DEFAULT_IMAGE }) {
  return (
    <header className={styles.banner}>
      <Image
        src={image.src}
        alt=""
        fill
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        quality={55}
        className={styles.image}
        style={{ objectPosition: image.position || "50% 50%" }}
      />
      <div className={styles.overlay} aria-hidden="true" />
      <Container className="relative flex flex-col items-center gap-4 py-16 text-center md:py-24">
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        <Breadcrumb items={breadcrumbs} className={styles.breadcrumb} />
        {lead && <p className={cn(styles.lead, "mt-2 max-w-2xl")}>{lead}</p>}
        {children && <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">{children}</div>}
      </Container>
    </header>
  );
}
