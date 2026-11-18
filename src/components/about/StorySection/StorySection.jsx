import Image from "next/image";
import Section from "@/components/ui/Section/Section";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import styles from "./StorySection.module.css";

/**
 * Company background beside a photograph, headed by the agency's motto.
 *
 * @param {object} props
 * @param {string[]} props.paragraphs
 * @param {string} props.motto
 */
export default function StorySection({ paragraphs, motto }) {
  return (
    <Section labelledBy="story-heading" containerClassName="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
      <div className="flex flex-col gap-6 lg:col-span-6">
        {/* The motto is the heading, as on the original About page. */}
        <SectionHeading id="story-heading" eyebrow="Who we are" title={motto} />
        <span className={styles.rule} aria-hidden="true" />
        <div className="flex flex-col gap-4 text-ink-700">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      <figure className="lg:col-span-6">
        <div className={styles.frame}>
          <Image
            src="/images/photos/team-consultation-desk.jpg"
            alt="Chitnam advisers in branded shirts working through applications at a consultation table"
            width={1296}
            height={864}
            sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 100vw"
            className={styles.img}
          />
        </div>
      </figure>
    </Section>
  );
}
