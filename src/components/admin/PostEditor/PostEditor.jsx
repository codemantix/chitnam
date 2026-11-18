import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/router";
import Card from "@/components/admin/Card/Card";
import Icon from "@/components/ui/Icon/Icon";
import MediaModal from "@/components/admin/MediaModal/MediaModal";
import Field from "@/components/forms/Field/Field";
import Alert from "@/components/ui/Alert/Alert";
import Button from "@/components/ui/Button/Button";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/constants/routes";
import { blogImageUrl } from "@/lib/supabase/config";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/date";
import { hasErrors, slugify, validatePost } from "@/utils/validation";
import styles from "./PostEditor.module.css";

// The editor only runs in the browser, and only admin pages load it.
const ClassicEditor = dynamic(() => import("@/components/admin/ClassicEditor/ClassicEditor"), {
  ssr: false,
  loading: () => (
    <div className={styles.editorLoading} role="status">
      Loading editor…
    </div>
  ),
});

/** ISO string → value for <input type="datetime-local"> in the browser's time zone. */
function toLocalInput(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function fromRow(post, authors) {
  return {
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    body: post?.body || "",
    coverImagePath: post?.cover_image_path || "",
    coverImageAlt: post?.cover_image_alt || "",
    categoryId: post?.category_id || "",
    authorId: post?.author_id || authors[0]?.id || "",
    status: post?.status || "draft",
    publishedAt: toLocalInput(post?.published_at),
    seoTitle: post?.seo_title || "",
    seoDescription: post?.seo_description || "",
  };
}

function Counter({ value, max }) {
  const over = value.length > max;
  return (
    <span className={cn(styles.counter, over && styles.counterOver)}>
      {value.length}/{max}
    </span>
  );
}

/**
 * Create / edit a blog post — layout modelled on the WordPress Classic editor.
 *
 * @param {object} props
 * @param {object|null} props.post Database row, or null for a new post.
 * @param {{ id: string, name: string }[]} props.categories
 * @param {{ id: string, name: string }[]} props.authors
 */
export default function PostEditor({ post, categories, authors }) {
  const router = useRouter();
  const isNew = !post;
  const wasPublished = post?.status === "published";
  const [values, setValues] = useState(() => fromRow(post, authors));
  const [slugEdited, setSlugEdited] = useState(Boolean(post?.slug));
  const [editingSlug, setEditingSlug] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error | deleting
  const [message, setMessage] = useState(router.query.created ? "Post created. Keep writing, then save." : "");
  const [featuredOpen, setFeaturedOpen] = useState(false);
  const [savingAs, setSavingAs] = useState(null); // which button started the save
  const dirty = useRef(false);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const onBeforeUnload = (event) => {
      if (!dirty.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const set = (name, value) => {
    dirty.current = true;
    setValues((current) => {
      const next = { ...current, [name]: value };
      if (name === "title" && !slugEdited) next.slug = slugify(value);
      return next;
    });
  };
  const onField = (event) => set(event.target.name, event.target.value);

  const save = async (nextStatus) => {
    const payload = {
      ...values,
      status: nextStatus,
      publishedAt: values.publishedAt ? new Date(values.publishedAt).toISOString() : null,
    };
    const { errors: clientErrors } = validatePost(payload);
    if (hasErrors(clientErrors)) {
      setErrors(clientErrors);
      setStatus("error");
      setMessage("Some fields need attention before this can be saved.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});
    setStatus("saving");
    setSavingAs(nextStatus);
    setMessage("");
    try {
      const response = await fetch(isNew ? "/api/admin/posts/" : `/api/admin/posts/${post.id}/`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (result.errors) setErrors(result.errors);
        setStatus("error");
        setMessage(result.message || "The post couldn't be saved.");
        return;
      }
      dirty.current = false;
      if (isNew) {
        router.replace(`/admin/posts/${result.id}/?created=1`);
        return;
      }
      setValues((current) => ({ ...current, status: nextStatus }));
      setStatus("saved");
      setMessage(
        nextStatus === "published"
          ? wasPublished
            ? "Post updated. The live article has been refreshed."
            : "Post published. It's now live on the blog."
          : wasPublished
            ? "Post switched to draft and removed from the blog."
            : "Draft saved."
      );
      // Refresh server data (e.g. publication date) without losing the editor.
      router.replace(router.asPath, undefined, { scroll: false });
    } catch {
      setStatus("error");
      setMessage("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSavingAs(null);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Move “${values.title || "this post"}” to the bin? This permanently deletes it.`)) return;
    setStatus("deleting");
    const response = await fetch(`/api/admin/posts/${post.id}/`, { method: "DELETE" }).catch(() => null);
    if (response?.ok) {
      dirty.current = false;
      router.replace("/admin/posts/?deleted=1");
      return;
    }
    setStatus("error");
    setMessage("The post couldn't be deleted. Please try again.");
  };

  const busy = status === "saving" || status === "deleting";
  const coverUrl = blogImageUrl(values.coverImagePath);
  const host = siteConfig.url.replace(/^https?:\/\//, "");
  const scheduled = values.publishedAt && new Date(values.publishedAt) > new Date();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
      {/* ================= Main column ================= */}
      <div className="flex min-w-0 flex-col gap-6">
        {message && <Alert tone={status === "error" ? "error" : "success"} title={message} />}

        <div className="flex flex-col gap-2">
          <label htmlFor="post-title" className="sr-only">
            Title
          </label>
          <input
            id="post-title"
            name="title"
            value={values.title}
            onChange={onField}
            placeholder="Add title"
            maxLength={140}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? "post-title-error" : undefined}
            className={cn(styles.title, errors.title && styles.titleInvalid)}
          />
          {errors.title && (
            <p id="post-title-error" className="px-1 text-sm text-error-700">
              {errors.title}
            </p>
          )}

          {/* Permalink, editable inline like WordPress */}
          <div className={cn(styles.permalink, "flex flex-wrap items-center gap-x-2 gap-y-2")}>
            <span className="font-medium text-ink-700">Permalink:</span>
            {editingSlug ? (
              <>
                <span className="text-ink-600">{host}/blog/</span>
                <label htmlFor="post-slug" className="sr-only">
                  URL slug
                </label>
                <input
                  id="post-slug"
                  autoFocus
                  value={values.slug}
                  onChange={(event) => {
                    setSlugEdited(true);
                    set("slug", event.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }}
                  className={styles.slugInput}
                />
                <button type="button" className={styles.pill} onClick={() => setEditingSlug(false)}>
                  OK
                </button>
              </>
            ) : (
              <>
                <span className="break-all text-ink-600">
                  {host}/blog/<strong className="font-semibold text-ink-900">{values.slug || "…"}</strong>/
                </span>
                <button type="button" className={styles.pill} onClick={() => setEditingSlug(true)}>
                  Edit
                </button>
              </>
            )}
          </div>
          {errors.slug && <p className="px-1 text-sm text-error-700">{errors.slug}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <ClassicEditor value={values.body} onChange={(html) => set("body", html)} error={errors.body} uploadName={values.slug || values.title} />
          {errors.body && <p className="px-1 text-sm text-error-700">{errors.body}</p>}
        </div>

        <Card title="Excerpt" description="A one- or two-sentence summary shown on the blog page and in search results.">
          <Field
            as="textarea"
            id="excerpt"
            name="excerpt"
            label="Summary"
            required
            rows={3}
            maxLength={300}
            value={values.excerpt}
            onChange={onField}
            error={errors.excerpt}
          />
          <div className="mt-1 flex justify-end">
            <Counter value={values.excerpt} max={300} />
          </div>
        </Card>

        <Card title="Search engine listing" description="Optional. Leave empty to use the title and excerpt.">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Field id="seoTitle" name="seoTitle" label="SEO title" value={values.seoTitle} onChange={onField} error={errors.seoTitle} />
                <Counter value={values.seoTitle} max={70} />
              </div>
              <div className="flex flex-col gap-1">
                <Field as="textarea" rows={3} id="seoDescription" name="seoDescription" label="Meta description" value={values.seoDescription} onChange={onField} error={errors.seoDescription} />
                <Counter value={values.seoDescription} max={170} />
              </div>
            </div>
            <div className={styles.serp} aria-label="Search result preview">
              <p className={styles.serpLabel}>Google preview</p>
              <p className={styles.serpUrl}>
                {host} › blog › {values.slug || "your-post"}
              </p>
              <p className={styles.serpTitle}>{(values.seoTitle || values.title || "Your article title").slice(0, 70)}</p>
              <p className={styles.serpText}>{(values.seoDescription || values.excerpt || "Your summary appears here…").slice(0, 160)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ================= Sidebar ================= */}
      <div className="flex flex-col gap-6">
        <Card title="Publish" padding="none" className={styles.sticky}>
          <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-wrap gap-2">
              {!isNew && (
                <Button type="button" variant="secondary" size="md" onClick={() => save("draft")} disabled={busy}>
                  {wasPublished ? "Switch to draft" : "Save draft"}
                </Button>
              )}
              {wasPublished && (
                <Button href={ROUTES.post(post.slug)} variant="secondary" target="_blank">
                  View post
                </Button>
              )}
              {isNew && (
                <Button type="button" variant="secondary" onClick={() => save("draft")} loading={savingAs === "draft"} disabled={busy}>
                  Save draft
                </Button>
              )}
            </div>

            <dl className={cn(styles.meta, "flex flex-col gap-3 text-sm")}>
              <div className="flex items-center gap-2">
                <Icon name="lock" size={18} className="text-ink-400" />
                <dt className="text-ink-600">Status:</dt>
                <dd className="font-semibold">
                  <span className={cn(styles.status, values.status === "published" ? styles.statusLive : styles.statusDraft)}>
                    {values.status === "published" ? (scheduled ? "Scheduled" : "Published") : "Draft"}
                  </span>
                </dd>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Icon name="calendar" size={18} className="text-ink-400" />
                  <dt className="text-ink-600">{scheduled ? "Scheduled for:" : "Publish:"}</dt>
                  <dd className="font-semibold">{values.publishedAt ? formatDate(new Date(values.publishedAt)) : "Immediately"}</dd>
                  <button type="button" className={styles.pill} onClick={() => setEditingDate((open) => !open)} aria-expanded={editingDate}>
                    {editingDate ? "Done" : "Edit"}
                  </button>
                </div>
                {editingDate && (
                  <Field
                    id="publishedAt"
                    name="publishedAt"
                    type="datetime-local"
                    label="Publication date"
                    hint="A future date schedules the post."
                    value={values.publishedAt}
                    onChange={onField}
                    error={errors.publishedAt}
                  />
                )}
              </div>
            </dl>
          </div>

          <div className={cn(styles.publishBar, "flex items-center justify-between gap-3 px-5 py-4")}>
            {!isNew ? (
              <button type="button" className={styles.trash} onClick={remove} disabled={busy}>
                {status === "deleting" ? "Deleting…" : "Move to bin"}
              </button>
            ) : (
              <span />
            )}
            <Button type="button" onClick={() => save("published")} loading={savingAs === "published"} disabled={busy}>
              {wasPublished ? "Update" : scheduled ? "Schedule" : "Publish"}
            </Button>
          </div>
        </Card>

        <Card title="Category">
          <fieldset className="flex max-h-56 flex-col gap-1 overflow-y-auto">
            <legend className="sr-only">Category</legend>
            {[{ id: "", name: "Uncategorised" }, ...categories].map((category) => (
              <label key={category.id || "none"} className={cn(styles.choice, values.categoryId === category.id && styles.choiceActive)}>
                <input type="radio" name="categoryId" value={category.id} checked={values.categoryId === category.id} onChange={onField} className="size-4 accent-brand-700" />
                {category.name}
              </label>
            ))}
          </fieldset>
        </Card>

        <Card title="Author">
          <Field as="select" id="authorId" name="authorId" label="Byline" placeholderOption="No author" options={authors.map((a) => ({ value: a.id, label: a.name }))} value={values.authorId} onChange={onField} />
        </Card>

        <Card title="Featured image">
          {coverUrl ? (
            <div className="flex flex-col gap-3">
              <button type="button" onClick={() => setFeaturedOpen(true)} className={styles.featured} title="Replace featured image">
                <Image src={coverUrl} alt={values.coverImageAlt || "Featured image"} fill sizes="320px" className="object-cover" />
              </button>
              <p className="text-xs text-ink-600">
                <span className="font-medium text-ink-900">Alt text:</span> {values.coverImageAlt || "—"}
              </p>
              {errors.coverImageAlt && <p className="text-sm text-error-700">{errors.coverImageAlt}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <button type="button" className="font-medium text-brand-700 hover:underline" onClick={() => setFeaturedOpen(true)}>
                  Replace image
                </button>
                <button
                  type="button"
                  className="font-medium text-error-700 hover:underline"
                  onClick={() => {
                    set("coverImagePath", "");
                    set("coverImageAlt", "");
                  }}
                >
                  Remove featured image
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setFeaturedOpen(true)} className={cn(styles.featuredEmpty, "flex flex-col items-center justify-center gap-2")}>
              <Icon name="image" size={26} />
              <span className="font-medium">Set featured image</span>
              <span className="text-xs text-ink-600">Landscape, at least 1600 × 900 px</span>
            </button>
          )}
        </Card>
      </div>

      <MediaModal
        open={featuredOpen}
        onClose={() => setFeaturedOpen(false)}
        mode="featured"
        uploadName={values.slug || values.title}
        initialAlt={values.coverImageAlt}
        onSelect={({ path, alt }) => {
          set("coverImagePath", path);
          set("coverImageAlt", alt);
          setFeaturedOpen(false);
        }}
      />
    </div>
  );
}
