import Image from "next/image";
import Section from "@/components/ui/Section/Section";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import styles from "./TeamSection.module.css";

/**
 * Team members with circular portraits, as on the original About page.
 * Renders nothing until data/team.js has published entries.
 *
 * @param {object} props
 * @param {{ name: string, role: string, photo: string|null }[]} props.members
 */
export default function TeamSection({ members }) {
  if (!members?.length) return null;

  return (
    <Section tone="sand" labelledBy="team-heading" containerClassName="flex flex-col items-center gap-12">
      <SectionHeading id="team-heading" eyebrow="Our team" title="The people you'll work with" align="center" />
      <ul className="grid w-full gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <li key={member.name} className="flex flex-col items-center gap-5 text-center">
            {member.photo && (
              <div className={styles.photo}>
                <Image src={member.photo} alt={`Portrait of ${member.name}`} fill sizes="(min-width: 1024px) 260px, 60vw" className={styles.img} />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <h3 className={styles.name}>{member.name}</h3>
              <p className="text-sm text-ink-600">{member.role}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
