import { BLOG_IMAGES_BUCKET } from "@/lib/supabase/config";
import { getBrowserClient } from "@/lib/supabase/browserClient";
import { slugify } from "@/utils/validation";

const ALLOWED = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
// Limit on what staff can pick. Big photos are fine: they're shrunk below.
const MAX_INPUT_BYTES = 25 * 1024 * 1024;
// Limit on what's stored after optimising.
const MAX_BYTES = 5 * 1024 * 1024;
// Longest edge kept. Covers show at most ~1440px wide (2x on retina is
// handled by next/image picking a smaller size), so 2000px is plenty.
const MAX_EDGE = 2000;
// Files already this small and this size are stored as they are.
const SMALL_ENOUGH = 400 * 1024;

function canvasToBlob(canvas, type, quality) {
  if (typeof canvas.convertToBlob === "function") {
    return canvas.convertToBlob({ type, quality }).catch(() => null);
  }
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function hasTransparency(context, width, height) {
  const { data } = context.getImageData(0, 0, width, height);
  for (let index = 3; index < data.length; index += 4) {
    if (data[index] < 255) return true;
  }
  return false;
}

/**
 * Resizes and re-encodes an image in the browser before upload, so the
 * stored file is small. Large originals (a 2 MB PNG screenshot, a 6 MB phone
 * photo) are slow for the server's image optimiser to download, and it gives
 * up after 7 seconds, leaving a broken image on the site.
 *
 * WebP is preferred (small, keeps transparency). Browsers that can't encode
 * WebP get JPEG, or PNG if the image has transparent areas. If anything
 * fails, or the result isn't smaller, the original file is used.
 *
 * @param {File} file
 * @returns {Promise<{ blob: Blob, type: string }>}
 */
export async function optimiseImage(file) {
  const original = { blob: file, type: file.type };
  if (typeof createImageBitmap !== "function") return original;

  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return original;
  }

  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= SMALL_ENOUGH) return original;

    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas =
      typeof OffscreenCanvas === "function"
        ? new OffscreenCanvas(width, height)
        : Object.assign(document.createElement("canvas"), { width, height });
    const context = canvas.getContext("2d");
    if (!context) return original;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, width, height);

    let blob = await canvasToBlob(canvas, "image/webp", 0.82);
    if (!blob || blob.type !== "image/webp") {
      // No WebP encoder (older Safari). JPEG can't hold transparency.
      const transparent = file.type !== "image/jpeg" && hasTransparency(context, width, height);
      blob = transparent
        ? await canvasToBlob(canvas, "image/png")
        : await canvasToBlob(canvas, "image/jpeg", 0.85);
    }
    if (!blob || !ALLOWED[blob.type]) return original;
    // Keep the original if re-encoding didn't help and nothing was resized.
    if (scale === 1 && blob.size >= file.size) return original;
    return { blob, type: blob.type };
  } catch {
    return original;
  } finally {
    bitmap.close?.();
  }
}

/**
 * Uploads an image to the blog-images bucket as the signed-in staff member.
 * Storage policies only allow staff to write, so this fails safely for
 * anyone else. Returns the stored path (not a URL).
 *
 * @param {File} file
 * @param {{ folder: "covers"|"content", name?: string }} options
 */
export async function uploadBlogImage(file, { folder, name }) {
  if (!ALLOWED[file.type]) throw new Error("Please choose a JPG, PNG, WebP or AVIF image.");
  if (file.size > MAX_INPUT_BYTES) throw new Error("Images must be 25 MB or smaller.");

  const { blob, type } = await optimiseImage(file);
  const extension = ALLOWED[type];
  if (blob.size > MAX_BYTES) throw new Error("This image is still over 5 MB after resizing. Try a smaller one.");

  const supabase = getBrowserClient();
  if (!supabase) throw new Error("Image uploads aren't available: Supabase isn't configured.");

  const now = new Date();
  const base = slugify(name || file.name.replace(/\.[^.]+$/, "")) || "image";
  const unique = Math.random().toString(36).slice(2, 8);
  // Flat folders (covers/, content/) so the media library can list each in one request.
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const path = `${folder}/${month}-${base}-${unique}.${extension}`;

  const { error } = await supabase.storage.from(BLOG_IMAGES_BUCKET).upload(path, blob, {
    cacheControl: "31536000",
    contentType: type,
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
