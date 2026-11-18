import FAQ from "@/components/ui/FAQ/FAQ";
import Section from "@/components/ui/Section/Section";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";

/**
 * FAQ block for service and destination pages.
 *
 * @param {object} props
 * @param {{ question: string, answer: string }[]} props.faqs
 * @param {string} [props.title="Common questions"]
 */
export default function ServiceFAQ({ faqs, title = "Common questions" }) {
  if (!faqs?.length) return null;

  return (
    <Section labelledBy="service-faq-heading" containerClassName="grid gap-10 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-4">
        <SectionHeading id="service-faq-heading" eyebrow="FAQs" title={title} />
      </div>
      <FAQ items={faqs} className="lg:col-span-8" />
    </Section>
  );
}
