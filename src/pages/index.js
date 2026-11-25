import AboutPreview from "@/components/home/AboutPreview/AboutPreview";
import BlogPreview from "@/components/home/BlogPreview/BlogPreview";
import CTASection from "@/components/home/CTASection/CTASection";
import FAQSection from "@/components/home/FAQSection/FAQSection";
import HeroSection from "@/components/home/HeroSection/HeroSection";
import PartnersSection from "@/components/home/PartnersSection/PartnersSection";
import ProcessSection from "@/components/home/ProcessSection/ProcessSection";
import ServicesSection from "@/components/home/ServicesSection/ServicesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection/TestimonialsSection";
import WhyChooseUs from "@/components/home/WhyChooseUs/WhyChooseUs";
import SEO from "@/components/ui/SEO/SEO";
import { facts, heroSlides, homeFaqs, processSteps, reasons } from "@/data/home";
import { partnerGroups } from "@/data/partners";
import { services } from "@/data/services";
import { testimonials } from "@/data/testimonials";
import { getPublishedPosts } from "@/services/posts";
import { faqSchema, organizationSchema } from "@/utils/schema";
import { withSiteSettings } from "@/lib/withSiteSettings";
import { useBusiness } from "@/hooks/useBusiness";

async function loadPageProps() {
  return {
    props: {
      // BlogPreview renders nothing until at least one post is published.
      latestPosts: await getPublishedPosts({ limit: 3 }),
    },
    revalidate: 3600,
  };
}

// Adds the business details from /admin/settings/ (header, footer, contact blocks).
export const getStaticProps = withSiteSettings(loadPageProps);

export default function HomePage({ latestPosts }) {
  const business = useBusiness();
  return (
    <>
      <SEO
        title="Study abroad consultants in Port Harcourt"
        description="Chitnam Penguins Links helps Nigerian students with course counselling, university admissions, student visa applications and pre-departure preparation. Based in Port Harcourt since 2015."
        path="/"
        jsonLd={[organizationSchema(business), faqSchema(homeFaqs)]}
      />
      <HeroSection slides={heroSlides} />
      <ServicesSection services={services} />
      <AboutPreview />
      <WhyChooseUs facts={facts} reasons={reasons} />
      <ProcessSection steps={processSteps} tone="sand" />
      <PartnersSection groups={partnerGroups} />
      <TestimonialsSection testimonials={testimonials} />
      <FAQSection faqs={homeFaqs} />
      <BlogPreview posts={latestPosts} />
      <CTASection />
    </>
  );
}
