import Button from "@/components/ui/Button/Button";
import Container from "@/components/ui/Container/Container";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import SEO from "@/components/ui/SEO/SEO";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/constants/routes";

/** Static page shown when the server hits an unexpected error. */
export default function ServerErrorPage() {
  const phone = siteConfig.contact.phones[0];
  return (
    <>
      <SEO title="Something went wrong" description="This page could not be loaded." path="/500/" noindex />
      <section className="py-24 md:py-32">
        <Container size="narrow">
          <SectionHeading
            as="h1"
            eyebrow="Error 500"
            title="Something went wrong on our side"
            lead={`Please try again in a few minutes. If you were sending us an enquiry and it did not go through, you can call ${phone.display} or email ${siteConfig.contact.email}.`}
          />
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href={ROUTES.home}>Go to the homepage</Button>
            <Button href={ROUTES.contact} variant="secondary">
              Contact details
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
