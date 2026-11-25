import Button from "@/components/ui/Button/Button";
import Container from "@/components/ui/Container/Container";
import { useBusiness } from "@/hooks/useBusiness";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";
import styles from "./CTASection.module.css";

/**
 * Full-width green call-to-action band, as on the original site.
 * Reused on most pages with page-specific copy.
 *
 * @param {object} props
 * @param {string} [props.title]
 * @param {string} [props.text]
 */
export default function CTASection({
  title = "Start your study abroad journey today!",
  text = "Tell us what you want to study and when. An adviser will get back to you to arrange a consultation.",
}) {
  const phone = useBusiness().phones[0];

  return (
    <section aria-labelledby="cta-heading" className={cn(styles.band, "py-14 md:py-16")}>
      <Container className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 id="cta-heading" className={styles.heading}>
            {title}
          </h2>
          {text && <p className={styles.text}>{text}</p>}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href={ROUTES.apply} size="lg" variant="inverse" withArrow>
              Apply now
            </Button>
            <Button href={ROUTES.contact} size="lg" variant="inverseOutline">
              Contact us
            </Button>
          </div>
          <p className={styles.text}>
            Or call{" "}
            <a href={`tel:${phone.tel}`} className={styles.phone}>
              {phone.display}
            </a>
          </p>
        </div>
      </Container>
    </section>
  );
}
