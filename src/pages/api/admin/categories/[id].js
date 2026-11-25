import { allowMethods, sendError } from "@/lib/http";
import { revalidateBlog } from "@/lib/revalidate";
import { requireStaffApi } from "@/services/auth";
import { deleteCategory, getPostSlugsByCategory, updateCategory } from "@/services/posts";
import { hasErrors, validateCategory } from "@/utils/validation";

export const config = { api: { bodyParser: { sizeLimit: "8kb" } } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * PATCH  /api/admin/categories/:id — rename / change description { name, description }
 * DELETE /api/admin/categories/:id — delete (its posts become uncategorised)
 * Staff only. Blog pages showing the category are refreshed afterwards.
 */
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["PATCH", "DELETE"])) return;
  const staff = await requireStaffApi(req, res);
  if (!staff) return;

  const { id } = req.query;
  if (typeof id !== "string" || !UUID.test(id)) return sendError(res, 400, "Invalid category id.");

  // Collected before the change so the affected article pages can be refreshed.
  const slugs = await getPostSlugsByCategory(staff.supabase, id);

  if (req.method === "DELETE") {
    try {
      await deleteCategory(staff.supabase, id);
      await revalidateBlog(res, slugs);
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error("[admin/categories] delete:", error.message);
      return sendError(res, 500, "The category couldn't be deleted. Please try again.");
    }
  }

  // validateCategory derives a slug from the name; it's only used for checks here.
  const { data, errors } = validateCategory(req.body || {});
  if (hasErrors(errors)) return sendError(res, 400, errors.name || errors.description, { errors });

  try {
    const category = await updateCategory(staff.supabase, id, data);
    await revalidateBlog(res, slugs);
    return res.status(200).json({ ok: true, category });
  } catch (error) {
    if (error.code === "PGRST116") return sendError(res, 404, "Category not found.");
    console.error("[admin/categories] update:", error.message);
    return sendError(res, 500, "The category couldn't be saved. Please try again.");
  }
}
