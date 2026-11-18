import { cn } from "@/utils/cn";
import styles from "./StepList.module.css";

/**
 * Numbered steps joined by a line.
 *
 * - "horizontal": vertical on small screens, a row from the large breakpoint
 *   (pass `columns` to match the number of steps).
 * - "vertical": always a vertical timeline (good beside other content).
 *
 * @param {object} props
 * @param {{ title: string, text: string }[]} props.steps
 * @param {"horizontal"|"vertical"} [props.layout="vertical"]
 * @param {3|4|5|6} [props.columns=4] Only used by the horizontal layout.
 * @param {"h3"|"h4"} [props.headingLevel="h3"]
 */
const COLUMNS = {
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

export default function StepList({
  steps,
  layout = "vertical",
  columns = 4,
  headingLevel: Heading = "h3",
  className,
}) {
  const horizontal = layout === "horizontal";

  return (
    <ol
      className={cn(
        styles.steps,
        horizontal ? cn(styles.horizontal, "grid gap-10 lg:gap-8", COLUMNS[columns]) : "flex flex-col gap-10",
        className
      )}
    >
      {steps.map((step, index) => (
        <li
          key={step.title}
          className={cn(styles.step, "relative flex flex-col gap-2 pl-14", horizontal && "lg:pl-0 lg:pt-16")}
        >
          <span className={styles.marker} aria-hidden="true">
            {index + 1}
          </span>
          <Heading className={styles.title}>{step.title}</Heading>
          <p className="text-ink-600">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}
