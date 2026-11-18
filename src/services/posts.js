import { blogImageUrl } from "@/lib/supabase/config";
import { getPublicClient } from "@/lib/supabase/publicClient";
import { readingMinutes } from "@/utils/html";

/**
 * Blog data access. Server only.
 *
 * Public functions use the anonymous client, so Row Level Security only
 * ever returns published posts. When Supabase isn't configured they
 * return empty results, so the site still builds.
 *
 * Admin functions take the request-scoped (staff) client.
 */

const PUBLIC_COLUMNS = `
  id, slug, title, excerpt, cover_image_path, cover_image_alt, published_at, updated_at,
  seo_title, seo_description,
  category:categories ( slug, name ),
  author:authors ( slug, name, role, bio )
`;

/** Converts a database row into the shape pages use. JSON-serialisable. */
function toPost(row, { withBody = false } = {}) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImage: blogImageUrl(row.cover_image_path),
    coverImageAlt: row.cover_image_alt || "",
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    seoTitle: row.seo_title || null,
    seoDescription: row.seo_description || null,
    category: row.category ? { slug: row.category.slug, name: row.category.name } : null,
    author: row.author
      ? { slug: row.author.slug, name: row.author.name, role: row.author.role || null, bio: row.author.bio || null }
      : null,
    ...(withBody ? { body: row.body, readingMinutes: readingMinutes(row.body) } : {}),
  };
}

const publishedQuery = (client, columns) =>
  client
    .from("posts")
    .select(columns)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

/** All published posts (newest first), without bodies. */
export async function getPublishedPosts({ limit } = {}) {
  const client = getPublicClient();
  if (!client) return [];
  let query = publishedQuery(client, PUBLIC_COLUMNS);
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) {
    console.error("[posts] getPublishedPosts:", error.message);
    return [];
  }
  return data.map((row) => toPost(row));
}

export async function getPublishedPostBySlug(slug) {
  const client = getPublicClient();
  if (!client) return null;
  const { data, error } = await publishedQuery(client, `${PUBLIC_COLUMNS}, body`).eq("slug", slug).maybeSingle();
  if (error) {
    console.error("[posts] getPublishedPostBySlug:", error.message);
    return null;
  }
  return data ? toPost(data, { withBody: true }) : null;
}

export async function getPublishedSlugs() {
  const client = getPublicClient();
  if (!client) return [];
  const { data, error } = await publishedQuery(client, "slug");
  if (error) return [];
  return data.map((row) => row.slug);
}

/** Up to `limit` other posts, same category first, then most recent. */
export async function getRelatedPosts(post, limit = 3) {
  const all = await getPublishedPosts({ limit: 30 });
  const others = all.filter((p) => p.slug !== post.slug);
  const sameCategory = others.filter((p) => post.category && p.category?.slug === post.category.slug);
  const rest = others.filter((p) => !sameCategory.includes(p));
  return [...sameCategory, ...rest].slice(0, limit);
}

export async function getCategories(client = getPublicClient()) {
  if (!client) return [];
  const { data, error } = await client.from("categories").select("id, slug, name, description").order("sort_order");
  if (error) return [];
  return data;
}

export async function getAuthors(client) {
  const { data, error } = await client.from("authors").select("id, slug, name").order("name");
  if (error) return [];
  return data;
}

// ---------------------------------------------------------------------------
// Admin (request-scoped staff client)
// ---------------------------------------------------------------------------

export async function listAllPosts(client) {
  const { data, error } = await client
    .from("posts")
    .select("id, slug, title, status, published_at, updated_at, category:categories ( name )")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function countPostsByStatus(client) {
  const counts = {};
  for (const status of ["draft", "published"]) {
    const { count, error } = await client.from("posts").select("id", { count: "exact", head: true }).eq("status", status);
    if (error) throw new Error(error.message);
    counts[status] = count || 0;
  }
  return counts;
}

export async function getPostForEditing(client, id) {
  const { data, error } = await client.from("posts").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getPostSlug(client, id) {
  const { data } = await client.from("posts").select("slug").eq("id", id).maybeSingle();
  return data?.slug || null;
}

export async function createPost(client, record) {
  const { data, error } = await client.from("posts").insert(record).select("id, slug").single();
  if (error) throw error;
  return data;
}

export async function updatePost(client, id, record) {
  const { data, error } = await client.from("posts").update(record).eq("id", id).select("id, slug").single();
  if (error) throw error;
  return data;
}

export async function deletePost(client, id) {
  const { error } = await client.from("posts").delete().eq("id", id);
  if (error) throw error;
}
