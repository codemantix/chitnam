import LegalContent from "@/components/legal/LegalContent/LegalContent";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import SEO from "@/components/ui/SEO/SEO";
import { ROUTES } from "@/constants/routes";
import { LEGAL_LAST_UPDATED, privacySections } from "@/data/legal";
import { crumbs } from "@/utils/breadcrumbs";
import { breadcrumbSchema } from "@/utils/schema";

const BREADCRUMBS = crumbs({ label: "Privacy policy", href: ROUTES.privacy });

export default function PrivacyPolicyPage() {
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
      <LegalContent sections={privacySections} lastUpdated={LEGAL_LAST_UPDATED} />
    </>
  );
}
