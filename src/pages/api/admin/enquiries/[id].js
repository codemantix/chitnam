import { ENQUIRY_STATUS_OPTIONS } from "@/constants/enquiry";
import { allowMethods, sendError } from "@/lib/http";
import { requireStaffApi } from "@/services/auth";
import { updateEnquiry } from "@/services/enquiries";
import { cleanText } from "@/utils/validation";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** PATCH /api/admin/enquiries/:id — update status and notes (staff only). */
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["PATCH"])) return;
  const staff = await requireStaffApi(req, res);
  if (!staff) return;

  const { id } = req.query;
  if (typeof id !== "string" || !UUID.test(id)) return sendError(res, 400, "Invalid enquiry id.");

  const { status, staffNotes } = req.body || {};
  if (status !== undefined && !ENQUIRY_STATUS_OPTIONS.some((option) => option.value === status))
    return sendError(res, 400, "Invalid status.");
  const notes = staffNotes === undefined ? undefined : cleanText(String(staffNotes), { multiline: true }).slice(0, 2000);

  try {
    await updateEnquiry(staff.supabase, id, { status, staffNotes: notes });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[admin/enquiries] update:", error.message);
    return sendError(res, 500, "The enquiry couldn't be updated. Please try again.");
  }
}
