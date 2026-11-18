import Image from "next/image";
import Container from "@/components/ui/Container/Container";
import Icon from "@/components/ui/Icon/Icon";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import { cn } from "@/utils/cn";
import styles from "./WhyChooseUs.module.css";

/**
 * "Why choose us" band in the layout of the original site: a photo fading in
 * from the left, figure cards on the right — using verified facts only —
 * followed by reasons and an explicit "no guarantees" statement.
 *
 * @param {object} props
 * @param {{ value: string, label: string, icon: string }[]} props.facts
 * @param {{ title: string, text: string }[]} props.reasons
 */
export default function WhyChooseUs({ facts, reasons }) {
  return (
    <section aria-labelledby="why-heading" className={styles.band}>
      <div className={styles.photo} aria-hidden="true">
        <Image src="/images/banners/graduates-celebrating.jpg" alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className={styles.img} />
      </div>

      <Container className="relative grid py-[var(--space-section)] lg:grid-cols-12">
        <div className="flex flex-col gap-10 lg:col-span-6 lg:col-start-7">
          <SectionHeading id="why-heading" eyebrow="Why choose Chitnam Penguins Links?" title="A trusted guide for students and parents since 2015" />

          <ul className="grid gap-4 sm:grid-cols-3">
            {facts.map((fact) => (
              <li key={fact.label} className={cn(styles.fact, "flex flex-col items-center gap-2 p-6 text-center")}>
                <span className={styles.factIcon} aria-hidden="true">
                  <Icon name={fact.icon} size={26} strokeWidth={1.5} />
                </span>
                <span className={styles.factValue}>{fact.value}</span>
                <span className={styles.factLabel}>{fact.label}</span>
              </li>
            ))}
          </ul>

          <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {reasons.map((reason) => (
              <li key={reason.title} className={cn(styles.reason, "flex gap-3")}>
                <span className={styles.check} aria-hidden="true">
                  <Icon name="check" size={16} strokeWidth={2.4} />
                </span>
                <span className="flex flex-col gap-1">
                  <h3 className={styles.reasonTitle}>{reason.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-600">{reason.text}</p>
                </span>
              </li>
            ))}
          </ul>

          <aside className={cn(styles.promise, "flex gap-4 p-5")} aria-label="Our approach to guarantees">
            <span className={styles.promiseIcon} aria-hidden="true">
              <Icon name="award" size={22} />
            </span>
            <p className="text-sm leading-relaxed text-ink-700">
              <strong className="text-ink-900">What we don’t promise:</strong> no honest agency can guarantee admission
              or a visa. Those decisions belong to universities and immigration authorities. We promise careful,
              accurate preparation and straight answers at every stage.
            </p>
          </aside>
        </div>
      </Container>
    </section>
  );
}
