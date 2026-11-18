import { BLOG_IMAGES_BUCKET } from "@/lib/supabase/config";
import { getBrowserClient } from "@/lib/supabase/browserClient";
import { slugify } from "@/utils/validation";

const ALLOWED = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Uploads an image to the blog-images bucket as the signed-in staff member.
 * Storage policies only allow staff to write, so this fails safely for
 * anyone else. Returns the stored path (not a URL).
 *
 * @param {File} file
 * @param {{ folder: "covers"|"content", name?: string }} options
 */
export async function uploadBlogImage(file, { folder, name }) {
  const extension = ALLOWED[file.type];
  if (!extension) throw new Error("Please choose a JPG, PNG, WebP or AVIF image.");
  if (file.size > MAX_BYTES) throw new Error("Images must be 5 MB or smaller. Try resizing it first.");

  const supabase = getBrowserClient();
  if (!supabase) throw new Error("Image uploads aren't available: Supabase isn't configured.");

  const now = new Date();
  const base = slugify(name || file.name.replace(/\.[^.]+$/, "")) || "image";
  const unique = Math.random().toString(36).slice(2, 8);
  // Flat folders (covers/, content/) so the media library can list each in one request.
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const path = `${folder}/${month}-${base}-${unique}.${extension}`;

  const { error } = await supabase.storage.from(BLOG_IMAGES_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return path;
}

/**
 * Lists images in the media library (covers + in-article images), newest
 * first. Requires a staff session (storage "list" policy).
 *
 * @returns {Promise<{ path: string, name: string, createdAt: string, size: number }[]>}
 */
export async function listBlogImages() {
  const supabase = getBrowserClient();
  if (!supabase) throw new Error("The media library isn't available: Supabase isn't configured.");

  const folders = ["content", "covers"];
  const results = await Promise.all(
    folders.map((folder) =>
      supabase.storage.from(BLOG_IMAGES_BUCKET).list(folder, { limit: 200, sortBy: { column: "created_at", order: "desc" } })
    )
  );
  const failed = results.find((result) => result.error);
  if (failed) throw new Error(`Couldn't load the media library: ${failed.error.message}`);

  return results
    .flatMap((result, index) =>
      (result.data || [])
        .filter((file) => file.id && /\.(jpe?g|png|webp|avif)$/i.test(file.name))
        .map((file) => ({
          path: `${folders[index]}/${file.name}`,
          name: file.name,
          createdAt: file.created_at,
          size: file.metadata?.size || 0,
        }))
    )
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
