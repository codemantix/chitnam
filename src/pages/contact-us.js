import Link from "next/link";
import ContactDetails from "@/components/contact/ContactDetails/ContactDetails";
import EnquiryForm from "@/components/forms/EnquiryForm/EnquiryForm";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Section from "@/components/ui/Section/Section";
import SEO from "@/components/ui/SEO/SEO";
import { ROUTES } from "@/constants/routes";
import { crumbs } from "@/utils/breadcrumbs";
import { cn } from "@/utils/cn";
import { breadcrumbSchema, localBusinessSchema } from "@/utils/schema";
import styles from "@/styles/pages/Contact.module.css";

const BREADCRUMBS = crumbs({ label: "Contact us", href: ROUTES.contact });

export default function ContactPage() {
  return (
    <>
      <SEO
        title="Contact us"
        description="Contact Chitnam Penguins Links in Rumuigbo, Port Harcourt. Call, email or visit our office, or send a message to a study abroad adviser."
        path={ROUTES.contact}
        jsonLd={[localBusinessSchema(), breadcrumbSchema(BREADCRUMBS)]}
      />
      <PageHeader
        image={{ src: "/images/banners/adviser-on-phone-call.jpg", position: "50% 35%" }}
        breadcrumbs={BREADCRUMBS}
        eyebrow="Contact us"
        title="Talk to a study abroad adviser"
        lead="Call, email or visit our Port Harcourt office, or send us a message and we'll get back to you."
      />

      <Section labelledBy="contact-heading" containerClassName="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <h2 id="contact-heading" className="text-h2">
            Get in touch
          </h2>
          <ContactDetails />
        </div>

        <div className={cn(styles.panel, "flex flex-col gap-6 self-start p-6 md:p-8 lg:col-span-7")}>
          <div className="flex flex-col gap-2">
            <h2 id="write-heading" className={styles.panelTitle}>
              Send us a message
            </h2>
            <p className="text-ink-700">
              For a full study abroad enquiry, use the{" "}
              <Link href={ROUTES.apply} className="font-medium text-brand-700 underline">
                Apply now form
              </Link>{" "}
              instead.
            </p>
          </div>
          <EnquiryForm variant="contact" />
        </div>
      </Section>
    </>
  );
}
