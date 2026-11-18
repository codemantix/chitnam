import ApproachSection from "@/components/about/ApproachSection/ApproachSection";
import MissionVision from "@/components/about/MissionVision/MissionVision";
import StorySection from "@/components/about/StorySection/StorySection";
import TeamSection from "@/components/about/TeamSection/TeamSection";
import CTASection from "@/components/home/CTASection/CTASection";
import Button from "@/components/ui/Button/Button";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import SEO from "@/components/ui/SEO/SEO";
import { ROUTES } from "@/constants/routes";
import { aboutContent } from "@/data/about";
import { publishedTeam } from "@/data/team";
import { crumbs } from "@/utils/breadcrumbs";
import { breadcrumbSchema, organizationSchema } from "@/utils/schema";

const BREADCRUMBS = crumbs({ label: "About us", href: ROUTES.about });

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About us"
        description="Chitnam Penguins Links is a study abroad consultancy founded in 2015 in Port Harcourt, owned and run by three partners with long experience in education placement."
        path={ROUTES.about}
        jsonLd={[organizationSchema(), breadcrumbSchema(BREADCRUMBS)]}
      />
      <PageHeader
        image={{ src: "/images/photos/team-consultation-desk.jpg", position: "50% 40%" }}
        breadcrumbs={BREADCRUMBS}
        eyebrow="About us"
        title="A study abroad agency built on personal guidance"
        lead="Since 2015 we have helped students from Port Harcourt and across Nigeria choose courses, apply to universities and prepare for life overseas."
      >
        <Button href={ROUTES.contact} withArrow>
          Talk to an adviser
        </Button>
        <Button href={ROUTES.services} variant="secondary">
          Our services
        </Button>
      </PageHeader>
      <StorySection paragraphs={aboutContent.background} motto={aboutContent.motto} />
      <MissionVision mission={aboutContent.mission} vision={aboutContent.vision} />
      <ApproachSection items={aboutContent.approach} />
      <TeamSection members={publishedTeam} />
      <CTASection
        title="Let's talk about your plans"
        text="Tell us where you are now and where you'd like to study. We'll arrange a consultation with an adviser."
      />
    </>
  );
}
