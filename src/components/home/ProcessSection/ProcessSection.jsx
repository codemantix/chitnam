import Section from "@/components/ui/Section/Section";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import StepList from "@/components/ui/StepList/StepList";

/**
 * Section wrapper around a horizontal StepList.
 *
 * @param {object} props
 * @param {{ title: string, text: string }[]} props.steps
 * @param {string} [props.eyebrow]
 * @param {string} [props.title]
 * @param {string} [props.lead]
 * @param {string} [props.id="process"] Used for the heading id.
 * @param {"paper"|"sand"|"brand"} [props.tone="paper"]
 */
export default function ProcessSection({
  steps,
  eyebrow = "How it works",
  title = "The admission process, step by step",
  lead = "Every application is different, but most students follow this path with us.",
  id = "process",
  tone = "paper",
}) {
  const headingId = `${id}-heading`;

  return (
    <Section tone={tone} labelledBy={headingId} containerClassName="flex flex-col gap-12 md:gap-16">
      <SectionHeading id={headingId} eyebrow={eyebrow} title={title} lead={lead} />
      <StepList
        steps={steps}
        layout="horizontal"
        columns={Math.min(Math.max(steps.length, 3), 6)}
      />
    </Section>
  );
}
