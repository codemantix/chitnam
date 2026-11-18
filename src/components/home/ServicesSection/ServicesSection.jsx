import Button from "@/components/ui/Button/Button";
import Section from "@/components/ui/Section/Section";
import ServiceCard from "@/components/ui/ServiceCard/ServiceCard";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";
import styles from "./ServicesSection.module.css";

/**
 * "Our services" intro (heading | divider | paragraph, as on the original
 * site) followed by the four service cards.
 *
 * @param {object} props
 * @param {{ slug: string, title: string, summary: string, icon: string }[]} props.services
 */
export default function ServicesSection({ services }) {
  return (
    <Section labelledBy="services-heading" containerClassName="flex flex-col gap-12 md:gap-14">
      <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-10">
        <div className="flex flex-col gap-3">
          <p className={styles.eyebrow}>Our services</p>
          <h2 id="services-heading" className={styles.heading}>
            Support at every stage of studying abroad
          </h2>
        </div>
        <span className={styles.divider} aria-hidden="true" />
        <div className="flex flex-col items-start gap-4">
          <p className="text-ink-600">
            From choosing a course to stepping off the plane, our advisers work with you and your family at each
            stage. Use one service, or let us guide you through all four.
          </p>
          <Button href={ROUTES.services} variant="ghost" withArrow>
            View all services
          </Button>
        </div>
      </div>

      <div className={cn(styles.cards, "grid gap-6 sm:grid-cols-2 lg:grid-cols-4")}>
        {services.map((service) => (
          <ServiceCard
            key={service.slug}
            icon={service.icon}
            title={service.title}
            summary={service.summary}
            href={ROUTES.service(service.slug)}
          />
        ))}
      </div>
    </Section>
  );
}
