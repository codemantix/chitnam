import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/date";
import styles from "./PostCard.module.css";

/**
 * Article teaser: optional cover, category and date, title and excerpt.
 * The whole card is clickable through the title link.
 *
 * @param {object} props
 * @param {object} props.post Shape from services/posts.js.
 * @param {"h2"|"h3"} [props.headingLevel="h3"]
 */
export default function PostCard({ post, headingLevel: Heading = "h3", className }) {
  return (
    <article className={cn(styles.card, "relative flex h-full flex-col gap-4", className)}>
      <div className={styles.media}>
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt}
            width={800}
            height={500}
            sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
            className={styles.img}
          />
        ) : (
          <div className={styles.placeholder} aria-hidden="true">
            <span>{post.category?.name || "Article"}</span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink-600">
        {post.category && <span className="font-medium text-brand-700">{post.category.name}</span>}
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      </div>
      <Heading className={styles.title}>
        <Link href={ROUTES.post(post.slug)} className={styles.link}>
          {post.title}
        </Link>
      </Heading>
      <p className="text-ink-600">{post.excerpt}</p>
    </article>
  );
}
