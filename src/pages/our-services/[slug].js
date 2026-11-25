import CTASection from "@/components/home/CTASection/CTASection";
import ProcessSection from "@/components/home/ProcessSection/ProcessSection";
import RelatedServices from "@/components/services/RelatedServices/RelatedServices";
import ServiceFAQ from "@/components/services/ServiceFAQ/ServiceFAQ";
import ServiceOverview from "@/components/services/ServiceOverview/ServiceOverview";
import Button from "@/components/ui/Button/Button";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import SEO from "@/components/ui/SEO/SEO";
import { ROUTES } from "@/constants/routes";
import { getServiceBySlug, services } from "@/data/services";
import { crumbs } from "@/utils/breadcrumbs";
import { breadcrumbSchema, faqSchema, serviceSchema } from "@/utils/schema";
import { withSiteSettings } from "@/lib/withSiteSettings";

// Maps a service to the topic pre-selected on the Apply form (Phase 4).
const INTEREST = {
  "university-admissions": "admissions",
  "student-visa-guidance": "visa",
  "career-counselling": "counselling",
  "pre-departure-support": "pre-departure",
};

export async function getStaticPaths() {
  return {
    paths: services.map((service) => ({ params: { slug: service.slug } })),
    fallback: false,
  };
}

async function loadPageProps({ params }) {
  const service = getServiceBySlug(params.slug);
  if (!service) return { notFound: true };

  return {
    props: {
      service,
      related: services
        .filter((s) => s.slug !== service.slug)
        .map(({ slug, title, summary }) => ({ slug, title, summary })),
    },
  };
}

// Adds the business details from /admin/settings/ (header, footer, contact blocks).
export const getStaticProps = withSiteSettings(loadPageProps);

export default function ServicePage({ service, related }) {
  const path = ROUTES.service(service.slug);
  const breadcrumbs = crumbs(
    { label: "Our services", href: ROUTES.services },
    { label: service.shortTitle, href: path }
  );

  return (
    <>
      <SEO
        title={service.seoTitle}
        description={service.seoDescription}
        path={path}
        jsonLd={[serviceSchema(service, path), breadcrumbSchema(breadcrumbs), faqSchema(service.faqs)]}
      />
      <PageHeader
        image={{ src: service.image.src, position: "50% 40%" }} breadcrumbs={breadcrumbs} eyebrow="Our services" title={service.title} lead={service.summary}>
        <Button href={`${ROUTES.apply}?interest=${INTEREST[service.slug]}`} withArrow>
          Start your enquiry
        </Button>
        <Button href={ROUTES.contact} variant="secondary">
          Talk to an adviser
        </Button>
      </PageHeader>
      <ServiceOverview intro={service.intro} audience={service.audience} includes={service.includes} />
      <ProcessSection
        steps={service.steps}
        tone="sand"
        id="service-process"
        eyebrow="The process"
        title="How it works"
        lead={null}
      />
      <ServiceFAQ faqs={service.faqs} />
      <RelatedServices services={related} />
      <CTASection
        title={`Ready to get started with ${service.shortTitle.toLowerCase()}?`}
        text="Send us a short enquiry and an adviser will get back to you to arrange a consultation."
      />
    </>
  );
}
