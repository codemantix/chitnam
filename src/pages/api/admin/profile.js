import { allowMethods, sendError } from "@/lib/http";
import { requireStaffApi } from "@/services/auth";
import { cleanText } from "@/utils/validation";

export const config = { api: { bodyParser: { sizeLimit: "4kb" } } };

/**
 * PUT /api/admin/profile — the signed-in staff member updates their own
 * name / job title, or marks their invitation as accepted.
 * Runs as the user; column grants and RLS limit it to their own row and to
 * full_name, job_title and accepted_at (never the role).
 */
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["PUT"])) return;
  const staff = await requireStaffApi(req, res);
  if (!staff) return;

  const body = req.body || {};
  const changes = {};
  const errors = {};

  if (body.fullName !== undefined) {
    const fullName = cleanText(body.fullName);
    if (fullName.length < 2) errors.fullName = "Enter your full name.";
    else if (fullName.length > 120) errors.fullName = "Keep your name under 120 characters.";
    else changes.full_name = fullName;
  }
  if (body.jobTitle !== undefined) {
    const jobTitle = cleanText(body.jobTitle);
    if (jobTitle.length > 80) errors.jobTitle = "Keep the job title under 80 characters.";
    else changes.job_title = jobTitle || null;
  }
  if (body.accept === true && !staff.profile.accepted_at) changes.accepted_at = new Date().toISOString();

  if (Object.keys(errors).length) return sendError(res, 400, "Please correct the highlighted fields.", { errors });
  if (!Object.keys(changes).length) return res.status(200).json({ ok: true });

  const { error } = await staff.supabase.from("staff_profiles").update(changes).eq("id", staff.user.id);
  if (error) {
    console.error("[admin/profile]", error.message);
    return sendError(res, 500, "Your profile couldn't be saved. Please try again.");
  }
  // Keep the Supabase account's display name in step with the profile.
  if (changes.full_name) await staff.supabase.auth.updateUser({ data: { full_name: changes.full_name } }).catch(() => {});
  return res.status(200).json({ ok: true });
}
