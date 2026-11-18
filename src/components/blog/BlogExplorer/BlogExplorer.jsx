import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import PostCard from "@/components/blog/PostCard/PostCard";
import Button from "@/components/ui/Button/Button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";
import styles from "./BlogExplorer.module.css";

/**
 * Category filter + search over the (statically generated) list of posts.
 * Filtering happens in the browser, so it's instant; the choice is kept in
 * the URL (?category=…&q=…) so filtered views can be shared.
 *
 * @param {object} props
 * @param {object[]} props.posts
 * @param {{ slug: string, name: string }[]} props.categories
 */
export default function BlogExplorer({ posts, categories }) {
  const router = useRouter();
  // Remount the search box once the query string is known, so ?q= pre-fills it.
  return <Explorer key={router.isReady ? "ready" : "loading"} posts={posts} categories={categories} router={router} />;
}

function Explorer({ posts, categories, router }) {
  const activeCategory = typeof router.query.category === "string" ? router.query.category : "";
  const [term, setTerm] = useState(typeof router.query.q === "string" ? router.query.q : "");

  const updateUrl = (next) => {
    const query = { ...router.query, ...next };
    Object.keys(query).forEach((key) => !query[key] && delete query[key]);
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true, scroll: false });
  };

  const visible = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return posts.filter((post) => {
      if (activeCategory && post.category?.slug !== activeCategory) return false;
      if (!needle) return true;
      return [post.title, post.excerpt, post.category?.name].filter(Boolean).join(" ").toLowerCase().includes(needle);
    });
  }, [posts, activeCategory, term]);

  // Only offer categories that actually have posts.
  const usedCategories = categories.filter((c) => posts.some((p) => p.category?.slug === c.slug));

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {usedCategories.length > 0 && (
          <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
            {[{ slug: "", name: "All" }, ...usedCategories].map((category) => {
              const selected = category.slug === activeCategory;
              return (
                <button
                  key={category.slug || "all"}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => updateUrl({ category: category.slug })}
                  className={cn(styles.chip, selected && styles.chipActive)}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        )}

        <form role="search" className="w-full lg:max-w-xs" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="blog-search" className="sr-only">
            Search articles
          </label>
          <input
            id="blog-search"
            type="search"
            placeholder="Search articles"
            value={term}
            onChange={(event) => {
              setTerm(event.target.value);
              updateUrl({ q: event.target.value });
            }}
            className={styles.search}
          />
        </form>
      </div>

      <p className="sr-only" aria-live="polite">
        {visible.length} {visible.length === 1 ? "article" : "articles"} shown
      </p>

      {visible.length > 0 ? (
        <ul className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((post) => (
            <li key={post.slug}>
              <PostCard post={post} headingLevel="h2" />
            </li>
          ))}
        </ul>
      ) : (
        <div className={cn(styles.empty, "flex flex-col items-start gap-4 p-8")}>
          <p className="font-medium text-ink-900">No articles match your search.</p>
          <p className="text-ink-600">Try a different word, or clear the filters to see everything.</p>
          <Button
            variant="secondary"
            onClick={() => {
              setTerm("");
              router.replace({ pathname: ROUTES.blog }, undefined, { shallow: true, scroll: false });
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
