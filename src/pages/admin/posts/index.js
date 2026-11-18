import { useMemo, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout/AdminLayout";
import Card from "@/components/admin/Card/Card";
import Icon from "@/components/ui/Icon/Icon";
import Alert from "@/components/ui/Alert/Alert";
import Button from "@/components/ui/Button/Button";
import { ROUTES } from "@/constants/routes";
import { withStaff } from "@/services/auth";
import { listAllPosts } from "@/services/posts";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/date";
import styles from "@/styles/pages/AdminList.module.css";

const FILTERS = [
  { value: "", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

export const getServerSideProps = withStaff(async ({ query }, { supabase }) => {
  const status = FILTERS.some((f) => f.value === query.status) ? query.status || "" : "";
  try {
    return { props: { posts: await listAllPosts(supabase), status, deleted: query.deleted === "1", loadError: false } };
  } catch (error) {
    console.error("[admin] posts:", error.message);
    return { props: { posts: [], status, deleted: false, loadError: true } };
  }
});

export default function AdminPostsPage({ staff, notConfigured, counts, posts = [], status, deleted, loadError }) {
  const [term, setTerm] = useState("");
  const now = new Date();

  const totals = useMemo(
    () => ({
      "": posts.length,
      published: posts.filter((p) => p.status === "published").length,
      draft: posts.filter((p) => p.status === "draft").length,
    }),
    [posts]
  );

  const visible = posts.filter(
    (post) => (!status || post.status === status) && (!term.trim() || post.title.toLowerCase().includes(term.trim().toLowerCase()))
  );

  return (
    <AdminLayout
      title="Posts"
      eyebrow="Blog"
      staff={staff}
      notConfigured={notConfigured}
      counts={counts}
      actions={
        <Button href="/admin/posts/new/" withArrow>
          Add new post
        </Button>
      }
    >
      {deleted && <Alert tone="success" title="Post deleted." />}
      {loadError && <Alert tone="error" title="Posts couldn't be loaded. Refresh the page to try again." />}

      <Card padding="none">
        <div className={cn(styles.toolbar, "flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between")}>
          <nav aria-label="Filter posts" className={styles.segmented}>
            {FILTERS.map((filter) => {
              const active = filter.value === status;
              return (
                <Link
                  key={filter.value || "all"}
                  href={filter.value ? `/admin/posts/?status=${filter.value}` : "/admin/posts/"}
                  aria-current={active ? "page" : undefined}
                  className={cn(styles.segment, active && styles.segmentActive)}
                >
                  {filter.label}
                  <span className={styles.segmentCount}>{totals[filter.value]}</span>
                </Link>
              );
            })}
          </nav>
          <div className={styles.search}>
            <Icon name="search" size={18} />
            <label htmlFor="post-search" className="sr-only">
              Search posts
            </label>
            <input id="post-search" type="search" placeholder="Search posts" value={term} onChange={(e) => setTerm(e.target.value)} />
          </div>
        </div>

        {posts.length === 0 && !loadError ? (
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <span className={styles.emptyIcon} aria-hidden="true">
              <Icon name="posts" size={28} />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-lg font-semibold">No posts yet</p>
              <p className="text-sm text-ink-600">Write your first article. It stays private until you publish it.</p>
            </div>
            <Button href="/admin/posts/new/">Write your first post</Button>
          </div>
        ) : visible.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-ink-600">No posts match this filter.</p>
        ) : (
          <ul className="flex flex-col p-2">
            {visible.map((post) => {
              const scheduled = post.status === "published" && post.published_at && new Date(post.published_at) > now;
              return (
                <li key={post.id} className={cn(styles.row, "grid items-center gap-x-4 gap-y-2 p-3 md:grid-cols-[minmax(0,1fr)_9rem_8rem_auto]")}>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <Link href={`/admin/posts/${post.id}/`} className={styles.rowTitle}>
                      {post.title}
                    </Link>
                    <span className="text-xs text-ink-600">
                      {post.category?.name || "Uncategorised"} · Edited {formatDate(post.updated_at)}
                    </span>
                  </div>
                  <span>
                    <span className={cn(styles.badge, post.status === "draft" ? styles.badgeDraft : scheduled ? styles.badgeScheduled : styles.badgeLive)}>
                      {post.status === "draft" ? "Draft" : scheduled ? "Scheduled" : "Published"}
                    </span>
                  </span>
                  <span className="text-sm text-ink-600">{post.published_at ? formatDate(post.published_at) : "—"}</span>
                  <span className="flex items-center gap-1 md:justify-end">
                    <Link href={`/admin/posts/${post.id}/`} className={styles.iconLink} title="Edit">
                      <Icon name="posts" size={18} />
                      <span className="sr-only">Edit {post.title}</span>
                    </Link>
                    {post.status === "published" && !scheduled && (
                      <a href={ROUTES.post(post.slug)} target="_blank" rel="noopener noreferrer" className={styles.iconLink} title="View on site">
                        <Icon name="eye" size={18} />
                        <span className="sr-only">View {post.title} (opens in a new tab)</span>
                      </a>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </AdminLayout>
  );
}

AdminPostsPage.getLayout = (page) => page;
