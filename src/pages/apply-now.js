import { useRouter } from "next/router";
import EnquiryForm from "@/components/forms/EnquiryForm/EnquiryForm";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Section from "@/components/ui/Section/Section";
import SEO from "@/components/ui/SEO/SEO";
import StepList from "@/components/ui/StepList/StepList";
import { siteConfig } from "@/config/site";
import { DESTINATION_OPTIONS, INTEREST_OPTIONS } from "@/constants/enquiry";
import { ROUTES } from "@/constants/routes";
import { crumbs } from "@/utils/breadcrumbs";
import { cn } from "@/utils/cn";
import { breadcrumbSchema } from "@/utils/schema";
import styles from "@/styles/pages/Apply.module.css";

const BREADCRUMBS = crumbs({ label: "Apply now", href: ROUTES.apply });

const NEXT_STEPS = [
  { title: "We read your enquiry", text: "An adviser reviews your details and goals." },
  { title: "We get in touch", text: "We contact you by phone or email to arrange a consultation." },
  { title: "We plan together", text: "You get clear options and next steps, with no obligation." },
];

/** Reads ?interest= and ?destination= from links elsewhere on the site. */
function defaultsFromQuery(query) {
  const pick = (options, value) => (options.some((o) => o.value === value) ? value : "");
  return {
    interest: pick(INTEREST_OPTIONS, String(query.interest || "")),
    destination: pick(DESTINATION_OPTIONS, String(query.destination || "")),
  };
}

export default function ApplyPage() {
  const router = useRouter();
  const phone = siteConfig.contact.phones[0];

  return (
    <>
      <SEO
        title="Apply now"
        description="Start your study abroad application with Chitnam Penguins Links. Tell us what and where you want to study and an adviser in Port Harcourt will get in touch."
        path={ROUTES.apply}
        jsonLd={[breadcrumbSchema(BREADCRUMBS)]}
      />
      <PageHeader
        image={{ src: "/images/banners/airport-gate-departure.jpg", position: "50% 50%" }}
        breadcrumbs={BREADCRUMBS}
        eyebrow="Apply now"
        title="Start your study abroad enquiry"
        lead="Tell us a little about yourself and what you'd like to study. It takes about three minutes, and there's no obligation."
      />

      <Section containerClassName="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          {/* Remount once the query string is available so defaults apply. */}
          <EnquiryForm
            key={router.isReady ? "ready" : "loading"}
            variant="apply"
            defaults={router.isReady ? defaultsFromQuery(router.query) : {}}
          />
        </div>

        <aside className="flex flex-col gap-8 lg:col-span-5" aria-labelledby="next-heading">
          <div className={cn(styles.panel, "flex flex-col gap-6 p-6 md:p-8")}>
            <h2 id="next-heading" className={styles.panelTitle}>
              What happens next
            </h2>
            <StepList steps={NEXT_STEPS} />
          </div>
          <div className="flex flex-col gap-2 text-sm text-ink-700">
            <p className="font-medium text-ink-900">Prefer to talk?</p>
            <p>
              Call{" "}
              <a href={`tel:${phone.tel}`} className="font-medium text-brand-700 underline">
                {phone.display}
              </a>{" "}
              or email{" "}
              <a href={`mailto:${siteConfig.contact.email}`} className="font-medium text-brand-700 underline break-all">
                {siteConfig.contact.email}
              </a>
              .
            </p>
          </div>
        </aside>
      </Section>
    </>
  );
}
