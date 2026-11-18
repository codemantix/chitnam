import Section from "@/components/ui/Section/Section";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import { cn } from "@/utils/cn";
import styles from "./TestimonialsSection.module.css";

/**
 * Genuine student testimonials. Renders nothing until data/testimonials.js
 * contains consented entries. No carousel: quotes are laid out statically.
 *
 * @param {object} props
 * @param {{ quote: string, name: string, detail?: string }[]} props.testimonials
 */
export default function TestimonialsSection({ testimonials }) {
  if (!testimonials?.length) return null;

  return (
    <Section tone="sand" labelledBy="testimonials-heading" containerClassName="flex flex-col gap-12">
      <SectionHeading id="testimonials-heading" eyebrow="In their words" title="What our students say" />
      <ul className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((item) => (
          <li key={item.name}>
            <figure className={cn(styles.card, "flex h-full flex-col gap-6 p-6 md:p-7")}>
              <blockquote className={styles.quote}>
                <p>{item.quote}</p>
              </blockquote>
              <figcaption className="mt-auto text-sm">
                <span className="font-medium text-ink-900">{item.name}</span>
                {item.detail && <span className="block text-ink-600">{item.detail}</span>}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
