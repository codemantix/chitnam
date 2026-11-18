import Section from "@/components/ui/Section/Section";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import { cn } from "@/utils/cn";
import styles from "./ApproachSection.module.css";

/**
 * Numbered principles in a two-column grid.
 *
 * @param {object} props
 * @param {{ title: string, text: string }[]} props.items
 */
export default function ApproachSection({ items }) {
  return (
    <Section labelledBy="approach-heading" containerClassName="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-4">
        <SectionHeading id="approach-heading" eyebrow="How we work" title="Our approach" />
      </div>
      <ol className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
        {items.map((item, index) => (
          <li key={item.title} className={cn(styles.item, "flex flex-col gap-3 p-6 md:p-7")}>
            <span className={styles.index} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className={styles.title}>{item.title}</h3>
            <p className="text-ink-600">{item.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
