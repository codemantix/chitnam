import Image from "next/image";
import Button from "@/components/ui/Button/Button";
import Section from "@/components/ui/Section/Section";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";
import styles from "./AboutPreview.module.css";

/**
 * About introduction beside a collage of the agency's own photographs,
 * laid out as on the original site: a tall photo of the Chitnam roll-up
 * banner next to two stacked event photos.
 */
export default function AboutPreview() {
  return (
    <Section labelledBy="about-heading" containerClassName="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
      <div className="flex flex-col gap-6 lg:col-span-6">
        <SectionHeading id="about-heading" eyebrow="About us" title="We're here to help you study abroad with confidence" />
        <div className="flex max-w-[var(--measure)] flex-col gap-4 text-ink-700">
          <p>
            {siteConfig.legalName} is an education placement agency established in {siteConfig.foundingYear}, with its
            headquarters in Port Harcourt, Rivers State, Nigeria.
          </p>
          <p>
            The agency is jointly owned and managed by three partners with long experience in education placement and
            student recruitment. Helping students in their search for a better education and career path is what we
            are known for.
          </p>
        </div>
        <Button href={ROUTES.about} withArrow className="self-start">
          Learn more about us
        </Button>
      </div>

      <div className={cn(styles.collage, "lg:col-span-6")}>
        <div className={cn(styles.photo, styles.tall)}>
          <Image
            src="/images/photos/study-abroad-banner.jpg"
            alt="Chitnam Penguins Links roll-up banner listing study destinations, programmes and services"
            fill
            sizes="(min-width: 1024px) 280px, 45vw"
            className={styles.img}
          />
        </div>
        <div className={styles.photo}>
          <Image
            src="/images/photos/staff-team-event.jpg"
            alt="Three members of the Chitnam team in branded white shirts and green lanyards"
            fill
            sizes="(min-width: 1024px) 280px, 45vw"
            className={styles.img}
          />
        </div>
        <div className={styles.photo}>
          <Image
            src="/images/photos/adviser-with-student.jpg"
            alt="A Chitnam adviser going through course information with a prospective student"
            fill
            sizes="(min-width: 1024px) 280px, 45vw"
            className={styles.img}
          />
        </div>
      </div>
    </Section>
  );
}
