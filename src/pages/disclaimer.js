import LegalContent from "@/components/legal/LegalContent/LegalContent";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import SEO from "@/components/ui/SEO/SEO";
import { ROUTES } from "@/constants/routes";
import { disclaimerSections, LEGAL_LAST_UPDATED } from "@/data/legal";
import { crumbs } from "@/utils/breadcrumbs";
import { breadcrumbSchema } from "@/utils/schema";

const BREADCRUMBS = crumbs({ label: "Disclaimer", href: ROUTES.disclaimer });

export default function DisclaimerPage() {
  return (
    <>
      <SEO
        title="Disclaimer"
        description="Important notices from Chitnam Penguins Links, including how to recognise fraudulent messages that use our name, and the limits of the information on this website."
        path={ROUTES.disclaimer}
        jsonLd={[breadcrumbSchema(BREADCRUMBS)]}
      />
      <PageHeader
        image={{ src: "/images/photos/team-consultation-desk.jpg", position: "50% 60%" }} breadcrumbs={BREADCRUMBS} eyebrow="Legal" title="Disclaimer" />
      <LegalContent sections={disclaimerSections} lastUpdated={LEGAL_LAST_UPDATED} />
    </>
  );
}
