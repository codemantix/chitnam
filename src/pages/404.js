import Button from "@/components/ui/Button/Button";
import Container from "@/components/ui/Container/Container";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import SEO from "@/components/ui/SEO/SEO";
import { ROUTES } from "@/constants/routes";

export default function NotFoundPage() {
  return (
    <>
      <SEO
        title="Page not found"
        description="The page you were looking for could not be found."
        path="/404/"
        noindex
      />
      <section className="py-24 md:py-32">
        <Container size="narrow">
          <SectionHeading
            as="h1"
            eyebrow="Error 404"
            title="We couldn’t find that page"
            lead="The link may be out of date, or the page may have moved during our website update. These pages should help you find what you need."
          />
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href={ROUTES.home}>Go to the homepage</Button>
            <Button href={ROUTES.services} variant="secondary">
              Our services
            </Button>
            <Button href={ROUTES.contact} variant="secondary">
              Contact us
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
