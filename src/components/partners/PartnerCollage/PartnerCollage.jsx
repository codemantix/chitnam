import Image from "next/image";
import { collageAlt } from "@/data/partners";
import styles from "./PartnerCollage.module.css";

/**
 * One region's partner logos (a single collage image from the old site)
 * with the institution names as text underneath, so they can be read,
 * searched and translated.
 *
 * @param {object} props
 * @param {object} props.group An entry from data/partners.js → partnerGroups.
 * @param {"h2"|"h3"} [props.headingLevel="h3"]
 */
export default function PartnerCollage({ group, headingLevel: Heading = "h3" }) {
  return (
    <article id={group.id} className={styles.card} aria-labelledby={`${group.id}-heading`}>
      <div className={styles.header}>
        <Heading id={`${group.id}-heading`} className={styles.title}>
          {group.region}
        </Heading>
        <span className={styles.count}>{group.institutions.length} institutions</span>
      </div>
      <div className={styles.media}>
        <Image
          src={group.image.src}
          alt={collageAlt(group)}
          width={group.image.width}
          height={group.image.height}
          sizes="(min-width: 960px) 880px, 100vw"
          className={styles.img}
        />
      </div>
      <ul className={styles.names}>
        {group.institutions.map((institution) => (
          <li key={institution.name}>
            {institution.name}
            <span className={styles.country}>, {institution.country}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
