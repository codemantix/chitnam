import { allowMethods, emailBaseUrl, publicOrigin, sendError } from "@/lib/http";
import { checkRateLimit } from "@/lib/rateLimit";
import { getAdminClient } from "@/lib/supabase/adminClient";
import { requireAdminApi } from "@/services/auth";
import { inviteMember, TeamError } from "@/services/team";
import { hasErrors, validateInvite } from "@/utils/validation";

export const config = { api: { bodyParser: { sizeLimit: "8kb" } } };

/** POST /api/admin/team — invite a team member (administrators only). */
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  const staff = await requireAdminApi(req, res);
  if (!staff) return;

  const { data, errors } = validateInvite(req.body || {});
  if (hasErrors(errors)) return sendError(res, 400, "Please correct the highlighted fields.", { errors });

  const admin = getAdminClient();
  if (!admin) return sendError(res, 503, "The server is missing SUPABASE_SERVICE_ROLE_KEY.");

  // Invitations send email; cap them to protect the sender's reputation.
  if (!(await checkRateLimit(admin, `invite:${staff.user.id}`, { limit: 20, windowSeconds: 60 * 60 }))) {
    return sendError(res, 429, "You've sent a lot of invitations in the last hour. Please try again later.");
  }

  try {
    const result = await inviteMember(admin, data, { inviterId: staff.user.id, origin: publicOrigin(req), emailOrigin: emailBaseUrl(), sendEmail: data.sendEmail });
    return res.status(201).json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof TeamError) return sendError(res, error.status, error.message, error.status === 409 ? { errors: { email: error.message } } : {});
    console.error("[admin/team] invite:", error.message);
    return sendError(res, 500, "The invitation couldn't be sent. Please try again.");
  }
}
