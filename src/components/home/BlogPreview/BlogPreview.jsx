import PostCard from "@/components/blog/PostCard/PostCard";
import Button from "@/components/ui/Button/Button";
import Section from "@/components/ui/Section/Section";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import { ROUTES } from "@/constants/routes";

/**
 * Latest articles on the homepage. Renders nothing until there are
 * published posts.
 *
 * @param {object} props
 * @param {object[]} props.posts Shape from services/posts.js.
 */
export default function BlogPreview({ posts }) {
  if (!posts?.length) return null;

  return (
    <Section labelledBy="blog-heading" containerClassName="flex flex-col gap-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading id="blog-heading" eyebrow="From the blog" title="Guides for students and parents" />
        <Button href={ROUTES.blog} variant="ghost" withArrow className="self-start md:self-end">
          All articles
        </Button>
      </div>
      <ul className="grid gap-10 md:grid-cols-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
