import LegalContent from "@/components/legal/LegalContent/LegalContent";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import SEO from "@/components/ui/SEO/SEO";
import { ROUTES } from "@/constants/routes";
import { LEGAL_LAST_UPDATED, privacySections } from "@/data/legal";
import { crumbs } from "@/utils/breadcrumbs";
import { breadcrumbSchema } from "@/utils/schema";
import { withSiteSettings } from "@/lib/withSiteSettings";
import { useBusiness } from "@/hooks/useBusiness";

const BREADCRUMBS = crumbs({ label: "Privacy policy", href: ROUTES.privacy });

// Adds the business details from /admin/settings/ (header, footer, contact blocks).
export const getStaticProps = withSiteSettings();

export default function PrivacyPolicyPage() {
  const business = useBusiness();
  return (
    <>
      <SEO
        title="Privacy policy"
        description="How Chitnam Penguins Links collects, uses and protects the personal information you share through our website enquiry forms."
        path={ROUTES.privacy}
        jsonLd={[breadcrumbSchema(BREADCRUMBS)]}
      />
      <PageHeader
        image={{ src: "/images/photos/team-consultation-desk.jpg", position: "50% 60%" }}
        breadcrumbs={BREADCRUMBS}
        eyebrow="Legal"
        title="Privacy policy"
        lead="What we collect when you contact us, why we collect it, and the choices you have."
      />
      <LegalContent sections={privacySections(business)} lastUpdated={LEGAL_LAST_UPDATED} />
    </>
  );
}
