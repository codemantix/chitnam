import { allowMethods, sendError } from "@/lib/http";
import { sanitizePostHtml } from "@/lib/sanitizeHtml";
import { revalidateBlog } from "@/lib/revalidate";
import { requireStaffApi } from "@/services/auth";
import { createPost } from "@/services/posts";
import { hasErrors, validatePost } from "@/utils/validation";

export const config = { api: { bodyParser: { sizeLimit: "400kb" } } };

/** POST /api/admin/posts — create a post (staff only). */
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  const staff = await requireStaffApi(req, res);
  if (!staff) return;

  const { data, errors } = validatePost(req.body || {});
  if (hasErrors(errors)) return sendError(res, 400, "Please correct the highlighted fields.", { errors });
  // Strip anything unsafe from the editor HTML before it reaches the database.
  data.body = sanitizePostHtml(data.body);

  try {
    // Runs as the signed-in user: RLS checks staff membership again.
    const created = await createPost(staff.supabase, data);
    if (data.status === "published") await revalidateBlog(res, [created.slug]);
    return res.status(201).json({ ok: true, id: created.id, slug: created.slug });
  } catch (error) {
    if (error.code === "23505") {
      return sendError(res, 409, "That URL slug is already used by another post.", {
        errors: { slug: "This slug is already in use. Choose a different one." },
      });
    }
    console.error("[admin/posts] create:", error.message);
    return sendError(res, 500, "The post couldn't be saved. Please try again.");
  }
}
