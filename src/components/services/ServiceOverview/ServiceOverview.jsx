import CheckList from "@/components/ui/CheckList/CheckList";
import Section from "@/components/ui/Section/Section";
import { cn } from "@/utils/cn";
import styles from "./ServiceOverview.module.css";

/**
 * Service introduction with "who it's for" and "what's included" panels.
 *
 * @param {object} props
 * @param {string[]} props.intro
 * @param {string[]} props.audience
 * @param {string[]} props.includes
 */
export default function ServiceOverview({ intro, audience, includes }) {
  return (
    <Section labelledBy="overview-heading" containerClassName="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="flex flex-col gap-5 lg:col-span-5">
        <h2 id="overview-heading" className={styles.heading}>
          Overview
        </h2>
        {intro.map((paragraph) => (
          <p key={paragraph} className="text-lead text-ink-700">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-10 lg:col-span-7">
        <div className={cn(styles.panel, "flex flex-col gap-5 p-6 md:p-8")}>
          <h2 className={styles.panelTitle}>Who it’s for</h2>
          <CheckList items={audience} />
        </div>
        <div className="flex flex-col gap-5">
          <h2 className={styles.panelTitle}>What’s included</h2>
          <CheckList items={includes} columns={2} />
        </div>
      </div>
    </Section>
  );
}
