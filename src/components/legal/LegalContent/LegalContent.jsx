import Container from "@/components/ui/Container/Container";
import Prose from "@/components/ui/Prose/Prose";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Lagos",
});

/**
 * Renders structured legal sections ({ heading, paragraphs?, list? }) as prose.
 *
 * @param {object} props
 * @param {{ heading: string, paragraphs?: string[], list?: string[] }[]} props.sections
 * @param {string} [props.lastUpdated] ISO date.
 */
export default function LegalContent({ sections, lastUpdated }) {
  return (
    <div className="py-14 md:py-20">
      <Container size="narrow">
        <Prose>
          {lastUpdated && (
            <p className="text-sm text-ink-600">
              Last updated: <time dateTime={lastUpdated}>{dateFormatter.format(new Date(lastUpdated))}</time>
            </p>
          )}
          {sections.map((section) => (
            <section key={section.heading} aria-label={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.list?.length > 0 && (
                <ul>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </Prose>
      </Container>
    </div>
  );
}
