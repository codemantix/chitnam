import CTASection from "@/components/home/CTASection/CTASection";
import ProcessSection from "@/components/home/ProcessSection/ProcessSection";
import ServiceList from "@/components/services/ServiceList/ServiceList";
import Button from "@/components/ui/Button/Button";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import SEO from "@/components/ui/SEO/SEO";
import { ROUTES } from "@/constants/routes";
import { processSteps } from "@/data/home";
import { services } from "@/data/services";
import { crumbs } from "@/utils/breadcrumbs";
import { breadcrumbSchema } from "@/utils/schema";
import { withSiteSettings } from "@/lib/withSiteSettings";

const BREADCRUMBS = crumbs({ label: "Our services", href: ROUTES.services });

// Adds the business details from /admin/settings/ (header, footer, contact blocks).
export const getStaticProps = withSiteSettings();

export default function ServicesPage() {
  return (
    <>
      <SEO
        title="Our services"
        description="Study abroad services from Chitnam Penguins Links in Port Harcourt: career and course counselling, university admissions, student visa guidance and pre-departure briefings."
        path={ROUTES.services}
        jsonLd={[breadcrumbSchema(BREADCRUMBS)]}
      />
      <PageHeader
        image={{ src: "/images/hero/course-counselling-mentor-student.jpg", position: "60% 35%" }}
        breadcrumbs={BREADCRUMBS}
        eyebrow="Our services"
        title="Everything you need to study abroad, in one place"
        lead="Four services that take you from choosing a course to arriving on campus. Use one, or let us guide you through them all."
      >
        <Button href={ROUTES.apply} withArrow>
          Start your enquiry
        </Button>
      </PageHeader>
      <ServiceList services={services} />
      <ProcessSection
        steps={processSteps}
        tone="sand"
        eyebrow="How they fit together"
        title="From first conversation to first semester"
        lead="Most students use our services in this order. You can join at any stage."
      />
      <CTASection />
    </>
  );
}
