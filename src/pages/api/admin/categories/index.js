import { allowMethods, sendError } from "@/lib/http";
import { revalidateBlog } from "@/lib/revalidate";
import { requireStaffApi } from "@/services/auth";
import { createCategory, reorderCategories } from "@/services/posts";
import { hasErrors, validateCategory } from "@/utils/validation";

export const config = { api: { bodyParser: { sizeLimit: "8kb" } } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/admin/categories — add a blog category.
 * PUT  /api/admin/categories — save the order: { ids: [uuid, …] }.
 * Staff only.
 */
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST", "PUT"])) return;
  const staff = await requireStaffApi(req, res);
  if (!staff) return;

  if (req.method === "PUT") {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : null;
    if (!ids || ids.length === 0 || ids.length > 200 || !ids.every((id) => typeof id === "string" && UUID.test(id)) || new Set(ids).size !== ids.length) {
      return sendError(res, 400, "Invalid category order.");
    }
    try {
      await reorderCategories(staff.supabase, ids);
      await revalidateBlog(res);
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error("[admin/categories] reorder:", error.message);
      return sendError(res, 500, "The new order couldn't be saved. Please try again.");
    }
  }

  const { data, errors } = validateCategory(req.body || {});
  if (hasErrors(errors)) return sendError(res, 400, errors.name || errors.description, { errors });

  try {
    // Runs as the signed-in user: RLS checks staff membership again.
    const category = await createCategory(staff.supabase, data);
    return res.status(201).json({ ok: true, category });
  } catch (error) {
    if (error.code === "23505") {
      return sendError(res, 409, "A category with that name already exists.", { errors: { name: "This category already exists." } });
    }
    console.error("[admin/categories] create:", error.message);
    return sendError(res, 500, "The category couldn't be added. Please try again.");
  }
}
