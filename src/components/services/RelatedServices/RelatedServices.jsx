import Section from "@/components/ui/Section/Section";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import ServiceCard from "@/components/ui/ServiceCard/ServiceCard";
import { ROUTES } from "@/constants/routes";

/**
 * Links to the other services, for internal linking between service pages.
 *
 * @param {object} props
 * @param {{ slug: string, title: string, summary: string }[]} props.services
 */
export default function RelatedServices({ services }) {
  if (!services?.length) return null;

  return (
    <Section tone="sand" spacing="tight" labelledBy="related-heading" containerClassName="flex flex-col gap-10">
      <SectionHeading id="related-heading" eyebrow="More services" title="Other ways we can help" />
      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard
            key={service.slug}
            title={service.title}
            summary={service.summary}
            href={ROUTES.service(service.slug)}
          />
        ))}
      </div>
    </Section>
  );
}
