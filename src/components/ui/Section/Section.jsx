import Container from "@/components/ui/Container/Container";
import { cn } from "@/utils/cn";
import styles from "./Section.module.css";

const TONES = {
  paper: styles.paper,
  sand: styles.sand,
  brand: styles.brand,
  ink: styles.ink,
};

const SPACING = {
  default: styles.spacingDefault,
  tight: styles.spacingTight,
};

/**
 * Full-width page section with consistent vertical rhythm and a background
 * tone (white, light grey, soft green or dark), in the style of the
 * original Chitnam site. `containerClassName` styles the content wrapper
 * (typically the grid). Pass `labelledBy` with the heading's id.
 *
 * @param {object} props
 * @param {"paper"|"sand"|"brand"|"ink"} [props.tone="paper"]
 * @param {"default"|"tight"} [props.spacing="default"]
 * @param {"default"|"narrow"|"wide"} [props.container="default"]
 * @param {string} [props.labelledBy]
 */
export default function Section({
  tone = "paper",
  spacing = "default",
  container = "default",
  labelledBy,
  id,
  className,
  containerClassName,
  children,
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn(TONES[tone], SPACING[spacing], className)}>
      <Container size={container} className={containerClassName}>
        {children}
      </Container>
    </section>
  );
}
