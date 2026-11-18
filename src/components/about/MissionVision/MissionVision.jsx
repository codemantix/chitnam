import Section from "@/components/ui/Section/Section";
import { cn } from "@/utils/cn";
import styles from "./MissionVision.module.css";

/**
 * Mission and vision as two large statements side by side.
 *
 * @param {object} props
 * @param {string} props.mission
 * @param {string} props.vision
 */
export default function MissionVision({ mission, vision }) {
  const items = [
    { label: "Our mission", text: mission },
    { label: "Our vision", text: vision },
  ];

  return (
    <Section tone="brand" labelledBy="mission-heading">
      <h2 id="mission-heading" className="sr-only">
        Mission and vision
      </h2>
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        {items.map((item) => (
          <div key={item.label} className={cn(styles.item, "flex flex-col gap-4 p-6 md:p-9")}>
            <h3 className={styles.label}>{item.label}</h3>
            <p className={styles.statement}>{item.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
