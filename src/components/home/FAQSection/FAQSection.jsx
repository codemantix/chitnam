import Button from "@/components/ui/Button/Button";
import FAQ from "@/components/ui/FAQ/FAQ";
import Section from "@/components/ui/Section/Section";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import { ROUTES } from "@/constants/routes";

/**
 * @param {object} props
 * @param {{ question: string, answer: string }[]} props.faqs
 */
export default function FAQSection({ faqs }) {
  return (
    <Section labelledBy="faq-heading" containerClassName="grid gap-10 lg:grid-cols-12 lg:gap-16">
      <div className="flex flex-col gap-6 lg:col-span-4">
        <SectionHeading
          id="faq-heading"
          eyebrow="Questions"
          title="Frequently asked questions"
          lead="Can't see your question here? Ask an adviser directly."
        />
        <Button href={ROUTES.contact} variant="ghost" withArrow className="self-start">
          Contact us
        </Button>
      </div>
      <FAQ items={faqs} className="lg:col-span-8" />
    </Section>
  );
}
