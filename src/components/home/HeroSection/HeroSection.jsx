import { siteConfig } from "@/config/site";
import HeroCarousel from "./HeroCarousel";
import styles from "./HeroSection.module.css";

/**
 * Homepage hero: full-width photo slider. The h1 (main search phrase) sits
 * above the rotating headline as a small label; slide headlines are h2s.
 *
 * @param {object} props
 * @param {object[]} props.slides See data/home.js → heroSlides.
 * @param {number} [props.autoplayMs=7000] Time per slide; 0 turns autoplay off.
 */
export default function HeroSection({ slides, autoplayMs = 7000 }) {
  const phone = siteConfig.contact.phones[0];

  return (
    <section aria-labelledby="hero-heading">
      <HeroCarousel
        slides={slides}
        autoplayMs={autoplayMs}
        heading={
          <h1 id="hero-heading" className={styles.eyebrow}>
            Study abroad consultants in Port Harcourt · Since {siteConfig.foundingYear}
          </h1>
        }
        footer={
          <p className={styles.call}>
            Prefer to talk?{" "}
            <a href={`tel:${phone.tel}`} className={styles.phone}>
              Call {phone.display}
            </a>
          </p>
        }
      />
    </section>
  );
}
