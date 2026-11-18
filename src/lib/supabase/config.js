/**
 * Supabase environment configuration.
 *
 * Public values (URL + anon key) are safe in the browser: access is
 * enforced by Row Level Security. The service-role key is server-only.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const BLOG_IMAGES_BUCKET = "blog-images";

/** True when the public Supabase variables are set. */
export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** Public URL for a file in the blog images bucket. */
export function blogImageUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/${BLOG_IMAGES_BUCKET}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}
