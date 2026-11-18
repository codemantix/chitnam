import CTASection from "@/components/home/CTASection/CTASection";
import PartnerCollage from "@/components/partners/PartnerCollage/PartnerCollage";
import Button from "@/components/ui/Button/Button";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Section from "@/components/ui/Section/Section";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import SEO from "@/components/ui/SEO/SEO";
import { ROUTES } from "@/constants/routes";
import { partnerGroups, partners } from "@/data/partners";
import { crumbs } from "@/utils/breadcrumbs";
import { breadcrumbSchema } from "@/utils/schema";

const BREADCRUMBS = crumbs({ label: "Partners", href: ROUTES.partners });

export default function PartnersPage() {
  return (
    <>
      <SEO
        title="Partner universities and colleges"
        description={`The ${partners.length} universities and colleges in Australia, New Zealand, the UK, the Netherlands, the USA and Canada that Chitnam Penguins Links works with.`}
        path={ROUTES.partners}
        jsonLd={[breadcrumbSchema(BREADCRUMBS)]}
      />
      <PageHeader
        image={{ src: "/images/partners/partner.png", position: "50% 30%" }}
        breadcrumbs={BREADCRUMBS}
        eyebrow="Partners"
        title="The institutions we work with"
        lead="We recommend universities and colleges for how well they fit each student, not just because we know them."
      />

      <Section labelledBy="partners-list-heading" containerClassName="flex flex-col gap-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="partners-list-heading"
            eyebrow="By region"
            title="Partner institutions"
            lead="Universities and colleges we work with, grouped by where they are."
          />
          <nav aria-label="Regions" className="flex flex-wrap gap-2">
            {partnerGroups.map((group) => (
              <Button key={group.id} href={`#${group.id}`} variant="secondary">
                {group.region}
              </Button>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-8">
          {partnerGroups.map((group) => (
            <PartnerCollage key={group.id} group={group} />
          ))}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-ink-600">
            Have a different university in mind? Ask us. We’ll tell you honestly whether we can help with an
            application there and what the entry requirements are.
          </p>
          <Button href={ROUTES.contact} variant="secondary" className="self-start sm:self-auto">
            Ask about a university
          </Button>
        </div>
      </Section>

      <CTASection />
    </>
  );
}
