import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button/Button";
import Icon from "@/components/ui/Icon/Icon";
import Section from "@/components/ui/Section/Section";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import { ROUTES } from "@/constants/routes";
import { collageAlt } from "@/data/partners";
import styles from "./PartnersSection.module.css";

/**
 * Partner institutions on the homepage: one card per region, linking to
 * that region on the partners page.
 *
 * @param {object} props
 * @param {object[]} props.groups data/partners.js → partnerGroups
 */
export default function PartnersSection({ groups }) {
  if (!groups?.length) return null;

  return (
    <Section spacing="tight" labelledBy="partners-heading" containerClassName="flex flex-col gap-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading id="partners-heading" eyebrow="Partners" title="Institutions we work with" />
        <Button href={ROUTES.partners} variant="ghost" withArrow className="self-start md:self-end">
          All partners
        </Button>
      </div>
      <ul className="grid gap-6 md:grid-cols-3">
        {groups.map((group) => (
          <li key={group.id} className={styles.card}>
            <div className={styles.media}>
              <Image
                src={group.image.src}
                alt={collageAlt(group)}
                width={group.image.width}
                height={group.image.height}
                sizes="(min-width: 768px) 33vw, 100vw"
                className={styles.img}
              />
            </div>
            <div className={styles.body}>
              <h3 className={styles.title}>
                <Link href={`${ROUTES.partners}#${group.id}`} className={styles.link}>
                  {group.region}
                </Link>
              </h3>
              <span className={styles.count}>
                {group.institutions.length} institutions <Icon name="arrowRight" size={16} />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
