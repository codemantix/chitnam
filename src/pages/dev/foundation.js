import Breadcrumb from "@/components/ui/Breadcrumb/Breadcrumb";
import Button from "@/components/ui/Button/Button";
import Container from "@/components/ui/Container/Container";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import SEO from "@/components/ui/SEO/SEO";
import ServiceCard from "@/components/ui/ServiceCard/ServiceCard";
import { ROUTES } from "@/constants/routes";
import { services } from "@/data/services";
import styles from "@/styles/pages/Foundation.module.css";

/**
 * DEVELOPMENT ONLY — design-system reference page.
 * Shows tokens and shared components so Tailwind + CSS Modules can be
 * checked together. Returns 404 in production builds unless
 * ENABLE_DEV_PAGES=true is set.
 */

const SWATCHES = [
  { name: "brand-600", note: "Logo green — marks only" },
  { name: "brand-700", note: "Links, primary buttons" },
  { name: "brand-800", note: "Hover" },
  { name: "brand-50", note: "Tinted background" },
  { name: "ink-900", note: "Text" },
  { name: "ink-600", note: "Secondary text" },
  { name: "ink-200", note: "Borders" },
  { name: "paper", note: "Page background" },
  { name: "sand-100", note: "Alternate background" },
];

const TYPE_SCALE = [
  { token: "--text-display", label: "Display", sample: "Study with clarity" },
  { token: "--text-h1", label: "H1", sample: "University admissions processing" },
  { token: "--text-h2", label: "H2", sample: "How the process works" },
  { token: "--text-h3", label: "H3", sample: "Choosing a course" },
  { token: "--text-lead", label: "Lead", sample: "Clear advice for students and parents in Port Harcourt.", body: true },
  { token: "--text-body", label: "Body", sample: "We guide you from the first conversation to your arrival on campus.", body: true },
];

export async function getStaticProps() {
  const enabled =
    process.env.NODE_ENV !== "production" ||
    process.env.ENABLE_DEV_PAGES === "true";
  if (!enabled) return { notFound: true };
  return { props: {} };
}

export default function FoundationPage() {
  return (
    <>
      <SEO
        title="Design system"
        description="Internal reference for the Chitnam design tokens and shared components."
        path="/dev/foundation/"
        noindex
      />
      <div className="py-16 md:py-24">
        <Container className="flex flex-col gap-20">
          <div className="flex flex-col gap-6">
            <Breadcrumb
              items={[
                { label: "Home", href: ROUTES.home },
                { label: "Design system", href: "/dev/foundation/" },
              ]}
            />
            <SectionHeading
              as="h1"
              eyebrow="Phase 1 · Foundation"
              title="Design system reference"
              lead="Tokens live in styles/variables.css. Tailwind utilities and CSS Modules both read from them."
            />
          </div>

          {/* Colour: Tailwind grid + CSS Module swatch treatment */}
          <section aria-labelledby="colour-heading" className="flex flex-col gap-8">
            <SectionHeading id="colour-heading" eyebrow="Tokens" title="Colour" />
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {SWATCHES.map((swatch) => (
                <li key={swatch.name} className="flex flex-col gap-2">
                  <span
                    className={styles.swatch}
                    style={{ backgroundColor: `var(--${swatch.name})` }}
                  />
                  <code className="text-sm font-medium">{swatch.name}</code>
                  <span className="text-sm text-ink-600">{swatch.note}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Type scale */}
          <section aria-labelledby="type-heading" className="flex flex-col gap-8">
            <SectionHeading id="type-heading" eyebrow="Tokens" title="Typography" />
            <dl className="flex flex-col">
              {TYPE_SCALE.map((row) => (
                <div
                  key={row.token}
                  className="grid gap-2 border-t border-ink-200 py-5 md:grid-cols-[10rem_1fr] md:gap-8"
                >
                  <dt className="text-sm text-ink-600">
                    {row.label} <code className="block text-xs">{row.token}</code>
                  </dt>
                  <dd
                    className={row.body ? "font-sans" : "font-display"}
                    style={{ fontSize: `var(${row.token})`, lineHeight: 1.15 }}
                  >
                    {row.sample}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Buttons */}
          <section aria-labelledby="buttons-heading" className="flex flex-col gap-8">
            <SectionHeading id="buttons-heading" eyebrow="Components" title="Buttons" />
            <div className="flex flex-wrap items-center gap-4">
              <Button href={ROUTES.apply} withArrow>
                Apply now
              </Button>
              <Button variant="secondary" href={ROUTES.contact}>
                Book a consultation
              </Button>
              <Button variant="ghost" href={ROUTES.services} withArrow>
                View services
              </Button>
              <Button size="lg">Large button</Button>
              <Button loading>Submitting</Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className={`${styles.inverseStrip} flex flex-wrap gap-4 p-8`}>
              <Button variant="inverse" withArrow>
                Inverse on dark
              </Button>
            </div>
          </section>

          {/* Service cards */}
          <section aria-labelledby="cards-heading" className="flex flex-col gap-8">
            <SectionHeading
              id="cards-heading"
              eyebrow="Components"
              title="Service cards"
              lead="Content from data/services.js. Hover or tab through to see the rule and arrow animate."
            />
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service, index) => (
                <ServiceCard
                  key={service.slug}
                  index={index + 1}
                  title={service.title}
                  summary={service.summary}
                  href={ROUTES.service(service.slug)}
                />
              ))}
            </div>
          </section>

          {/* Heading alignment */}
          <section aria-labelledby="center-heading" className="border-t border-ink-200 pt-16">
            <SectionHeading
              id="center-heading"
              align="center"
              eyebrow="Components"
              title="Centred section heading"
              lead="Used sparingly, for closing calls to action."
            />
          </section>
        </Container>
      </div>
    </>
  );
}
