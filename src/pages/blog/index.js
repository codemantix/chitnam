import BlogExplorer from "@/components/blog/BlogExplorer/BlogExplorer";
import CTASection from "@/components/home/CTASection/CTASection";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Prose from "@/components/ui/Prose/Prose";
import Section from "@/components/ui/Section/Section";
import SEO from "@/components/ui/SEO/SEO";
import { ROUTES } from "@/constants/routes";
import { getCategories, getPublishedPosts } from "@/services/posts";
import { crumbs } from "@/utils/breadcrumbs";
import { breadcrumbSchema } from "@/utils/schema";

const BREADCRUMBS = crumbs({ label: "Blog", href: ROUTES.blog });

// Rebuilt in the background at most every 5 minutes, and immediately when
// staff publish or update a post (on-demand revalidation in the admin API).
export async function getStaticProps() {
  const [posts, categories] = await Promise.all([getPublishedPosts(), getCategories()]);
  return {
    props: { posts, categories: categories.map(({ slug, name }) => ({ slug, name })) },
    revalidate: 300,
  };
}

export default function BlogPage({ posts, categories }) {
  const hasPosts = posts.length > 0;

  return (
    <>
      <SEO
        title="Study abroad blog"
        description="Practical guides for Nigerian students and parents on university admissions, student visas, scholarships and preparing to study abroad."
        path={ROUTES.blog}
        // An empty blog is thin content; keep it out of search results until the first post is live.
        noindex={!hasPosts}
        jsonLd={[breadcrumbSchema(BREADCRUMBS)]}
      />
      <PageHeader
        image={{ src: "/images/hero/admissions-student-applying-laptop.jpg", position: "60% 35%" }}
        breadcrumbs={BREADCRUMBS}
        eyebrow="Blog"
        title="Guides for students and parents"
        lead="Practical advice on choosing a course, applying to universities, preparing your student visa and getting ready to travel."
      />

      <Section>
        {hasPosts ? (
          <BlogExplorer posts={posts} categories={categories} />
        ) : (
          <Prose>
            <h2>Our first articles are on the way</h2>
            <p>
              We’re writing guides on admissions, student visas, scholarships and pre-departure planning. In
              the meantime, our advisers are happy to answer your questions directly.
            </p>
          </Prose>
        )}
      </Section>

      <CTASection />
    </>
  );
}
