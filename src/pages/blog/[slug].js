import Image from "next/image";
import Link from "next/link";
import AuthorBox from "@/components/blog/AuthorBox/AuthorBox";
import PostCard from "@/components/blog/PostCard/PostCard";
import CTASection from "@/components/home/CTASection/CTASection";
import Breadcrumb from "@/components/ui/Breadcrumb/Breadcrumb";
import Container from "@/components/ui/Container/Container";
import Prose from "@/components/ui/Prose/Prose";
import Section from "@/components/ui/Section/Section";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import SEO from "@/components/ui/SEO/SEO";
import { ROUTES } from "@/constants/routes";
import { getPublishedPostBySlug, getPublishedSlugs, getRelatedPosts } from "@/services/posts";
import { crumbs } from "@/utils/breadcrumbs";
import { formatDate } from "@/utils/date";
import { sanitizePostHtml } from "@/lib/sanitizeHtml";
import { articleSchema, breadcrumbSchema } from "@/utils/schema";
import styles from "@/styles/pages/BlogPost.module.css";
import { withSiteSettings } from "@/lib/withSiteSettings";

export async function getStaticPaths() {
  const slugs = await getPublishedSlugs();
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    // New posts are rendered on first request, then cached.
    fallback: "blocking",
  };
}

async function loadPageProps({ params }) {
  const post = await getPublishedPostBySlug(params.slug);
  if (!post) return { notFound: true, revalidate: 60 };

  const related = await getRelatedPosts(post, 3);
  // Sanitised again at render time (it was also sanitised on save), so content
  // edited directly in the database can never inject scripts.
  const { body, ...rest } = post;
  return {
    props: { post: { ...rest, html: sanitizePostHtml(body) }, related },
    revalidate: 300,
  };
}

// Adds the business details from /admin/settings/ (header, footer, contact blocks).
export const getStaticProps = withSiteSettings(loadPageProps);

export default function BlogPostPage({ post, related }) {
  const path = ROUTES.post(post.slug);
  const breadcrumbs = crumbs({ label: "Blog", href: ROUTES.blog }, { label: post.title, href: path });
  const updated = post.updatedAt && formatDate(post.updatedAt) !== formatDate(post.publishedAt);

  return (
    <>
      <SEO
        title={post.seoTitle || post.title}
        description={post.seoDescription || post.excerpt}
        path={path}
        type="article"
        image={post.coverImage || undefined}
        imageAlt={post.coverImageAlt || post.title}
        article={{ publishedTime: post.publishedAt, modifiedTime: post.updatedAt, author: post.author?.name }}
        jsonLd={[articleSchema(post, path), breadcrumbSchema(breadcrumbs)]}
      />

      <article>
        <header className="pt-8 pb-10 md:pt-10 md:pb-14">
          <Container size="narrow" className="flex flex-col gap-6">
            <Breadcrumb items={breadcrumbs} />
            {post.category && (
              <Link href={`${ROUTES.blog}?category=${post.category.slug}`} className={styles.category}>
                {post.category.name}
              </Link>
            )}
            <h1 className={styles.title}>{post.title}</h1>
            <p className="text-lead text-ink-600">{post.excerpt}</p>
            <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink-600">
              {post.author && <span>By {post.author.name}</span>}
              <span aria-hidden="true">·</span>
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              {updated && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    Updated <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
                  </span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>{post.readingMinutes} min read</span>
            </p>
          </Container>
        </header>

        {post.coverImage && (
          <Container size="wide" className="mb-12 md:mb-16">
            <div className={styles.cover}>
              <Image
                src={post.coverImage}
                alt={post.coverImageAlt}
                width={1600}
                height={900}
                loading="eager"
                fetchPriority="high"
                sizes="(min-width: 1408px) 1344px, 100vw"
                className={styles.coverImg}
              />
            </div>
          </Container>
        )}

        <Container size="narrow" className="flex flex-col gap-14 pb-16 md:pb-24">
          {/* Sanitised in getStaticProps by lib/sanitizeHtml.js. */}
          <Prose html={post.html} />
          <AuthorBox author={post.author} />
        </Container>
      </article>

      {related.length > 0 && (
        <Section tone="sand" spacing="tight" labelledBy="related-heading" containerClassName="flex flex-col gap-10">
          <SectionHeading id="related-heading" eyebrow="Keep reading" title="Related articles" />
          <ul className="grid gap-10 md:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <PostCard post={item} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <CTASection title="Have a question about your plans?" text="Our advisers can talk you through your options. Send us an enquiry and we'll get back to you." />
    </>
  );
}
