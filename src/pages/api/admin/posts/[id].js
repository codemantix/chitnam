import { allowMethods, sendError } from "@/lib/http";
import { sanitizePostHtml } from "@/lib/sanitizeHtml";
import { revalidateBlog } from "@/lib/revalidate";
import { requireStaffApi } from "@/services/auth";
import { deletePost, getPostSlug, updatePost } from "@/services/posts";
import { hasErrors, validatePost } from "@/utils/validation";

export const config = { api: { bodyParser: { sizeLimit: "400kb" } } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * PUT    /api/admin/posts/:id — update (incl. publish / unpublish)
 * DELETE /api/admin/posts/:id — delete
 * Staff only. Public pages are revalidated after each change.
 */
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["PUT", "DELETE"])) return;
  const staff = await requireStaffApi(req, res);
  if (!staff) return;

  const { id } = req.query;
  if (typeof id !== "string" || !UUID.test(id)) return sendError(res, 400, "Invalid post id.");

  const previousSlug = await getPostSlug(staff.supabase, id);
  if (!previousSlug) return sendError(res, 404, "Post not found.");

  if (req.method === "DELETE") {
    try {
      await deletePost(staff.supabase, id);
      await revalidateBlog(res, [previousSlug]);
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error("[admin/posts] delete:", error.message);
      return sendError(res, 500, "The post couldn't be deleted. Please try again.");
    }
  }

  const { data, errors } = validatePost(req.body || {});
  if (hasErrors(errors)) return sendError(res, 400, "Please correct the highlighted fields.", { errors });
  // Strip anything unsafe from the editor HTML before it reaches the database.
  data.body = sanitizePostHtml(data.body);

  try {
    const updated = await updatePost(staff.supabase, id, data);
    // Revalidate both URLs if the slug changed, so the old one stops serving.
    await revalidateBlog(res, [previousSlug, updated.slug]);
    return res.status(200).json({ ok: true, id: updated.id, slug: updated.slug });
  } catch (error) {
    if (error.code === "23505") {
      return sendError(res, 409, "That URL slug is already used by another post.", {
        errors: { slug: "This slug is already in use. Choose a different one." },
      });
    }
    console.error("[admin/posts] update:", error.message);
    return sendError(res, 500, "The post couldn't be saved. Please try again.");
  }
}
