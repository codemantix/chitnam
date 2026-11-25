import { allowMethods, sendError } from "@/lib/http";
import { revalidateBlog, revalidatePublicSite } from "@/lib/revalidate";
import { requireAdminApi } from "@/services/auth";
import { saveSetting } from "@/services/settings";
import { hasErrors } from "@/utils/validation";
import { SETTINGS_KEYS, SETTINGS_VALIDATORS } from "@/utils/settings";
import { ROUTES } from "@/constants/routes";

export const config = { api: { bodyParser: { sizeLimit: "16kb" } } };

/**
 * PUT /api/admin/settings — { key: "business" | "blog" | "enquiries", value }
 * Administrators only. Pages that show the setting are refreshed afterwards.
 */
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["PUT"])) return;
  const staff = await requireAdminApi(req, res);
  if (!staff) return;

  const { key, value } = req.body || {};
  if (!SETTINGS_KEYS.includes(key)) return sendError(res, 400, "Unknown settings section.");

  const { data, errors } = SETTINGS_VALIDATORS[key](value || {});
  if (hasErrors(errors)) return sendError(res, 400, "Please correct the highlighted fields.", { errors });

  try {
    // Runs as the signed-in admin; RLS ("Admins manage settings") checks again.
    await saveSetting(staff.supabase, key, data, staff.user.id);
  } catch (error) {
    console.error("[admin/settings] save:", error.message);
    const missingTable = /relation .*settings.* does not exist|schema cache/i.test(error.message);
    return sendError(res, 500, missingTable ? "Run supabase/migrations/0004_team_and_settings.sql first, then try again." : "Settings couldn't be saved. Please try again.");
  }

  let refreshed = null;
  if (key === "business") refreshed = await revalidatePublicSite(res);
  if (key === "blog") await revalidateBlog(res);
  if (key === "enquiries") await Promise.allSettled([res.revalidate(ROUTES.contact), res.revalidate(ROUTES.apply)]);

  return res.status(200).json({ ok: true, value: data, refreshed });
}
