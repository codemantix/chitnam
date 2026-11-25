import { allowMethods, emailBaseUrl, publicOrigin, sendError } from "@/lib/http";
import { getAdminClient } from "@/lib/supabase/adminClient";
import { requireAdminApi } from "@/services/auth";
import { createInviteLink, removeMember, resendInvite, TeamError, updateMember } from "@/services/team";
import { cleanText } from "@/utils/validation";

export const config = { api: { bodyParser: { sizeLimit: "4kb" } } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * PATCH  /api/admin/team/:id  { role?, jobTitle? }        change role / title
 * POST   /api/admin/team/:id  { action: "link" | "resend" } new invite link / resend email
 * DELETE /api/admin/team/:id                              remove access
 * Administrators only.
 */
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["PATCH", "POST", "DELETE"])) return;
  const staff = await requireAdminApi(req, res);
  if (!staff) return;

  const { id } = req.query;
  if (typeof id !== "string" || !UUID.test(id)) return sendError(res, 400, "Invalid team member.");

  const admin = getAdminClient();
  if (!admin) return sendError(res, 503, "The server is missing SUPABASE_SERVICE_ROLE_KEY.");

  try {
    if (req.method === "DELETE") {
      await removeMember(admin, id, staff.user.id);
      return res.status(200).json({ ok: true });
    }
    if (req.method === "POST") {
      const action = req.body?.action;
      if (action === "link") return res.status(200).json({ ok: true, link: await createInviteLink(admin, id, publicOrigin(req)) });
      if (action === "resend") {
        await resendInvite(admin, id, emailBaseUrl());
        return res.status(200).json({ ok: true });
      }
      return sendError(res, 400, "Unknown action.");
    }
    const role = req.body?.role;
    if (role !== undefined && !["admin", "editor"].includes(role)) return sendError(res, 400, "Choose a valid role.");
    const jobTitle = req.body?.jobTitle === undefined ? undefined : cleanText(req.body.jobTitle).slice(0, 80);
    await updateMember(admin, id, { role, jobTitle }, staff.user.id);
    return res.status(200).json({ ok: true });
  } catch (error) {
    if (error instanceof TeamError) return sendError(res, error.status, error.message);
    console.error("[admin/team]", req.method, error.message);
    return sendError(res, 500, "That change couldn't be saved. Please try again.");
  }
}
