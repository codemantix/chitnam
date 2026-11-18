import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerClient } from "@/lib/supabase/serverClient";
import { isSameOrigin, sendError } from "@/lib/http";

/**
 * Staff authorisation. Server only.
 *
 * `getUser()` validates the session with Supabase (it does not just trust
 * the cookie). A signed-in user is only treated as staff if they have a
 * row in staff_profiles. Row Level Security enforces the same rule in the
 * database, so a mistake here still can't expose data.
 */
export async function getStaffContext(req, res) {
  const supabase = getServerClient(req, res);
  if (!supabase) return { configured: false, supabase: null, user: null, profile: null };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { configured: true, supabase, user: null, profile: null };

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return { configured: true, supabase, user, profile: profile || null };
}

/**
 * Wraps getServerSideProps for admin pages.
 *  - Never cached, never indexed.
 *  - Not configured → renders the page with { notConfigured: true }.
 *  - Not signed in / not staff → redirects to the login page.
 *  - Otherwise calls `handler(ctx, { supabase, user, profile })`; the staff
 *    member's name and role are added to the page props.
 */
export function withStaff(handler) {
  return async (ctx) => {
    ctx.res.setHeader("Cache-Control", "private, no-store");
    ctx.res.setHeader("X-Robots-Tag", "noindex, nofollow");

    if (!isSupabaseConfigured()) return { props: { notConfigured: true, staff: null } };

    const staffContext = await getStaffContext(ctx.req, ctx.res);
    if (!staffContext.user || !staffContext.profile) {
      const reason = staffContext.user ? "&error=not-staff" : "";
      return {
        redirect: {
          destination: `/admin/login/?next=${encodeURIComponent(ctx.resolvedUrl)}${reason}`,
          permanent: false,
        },
      };
    }

    const [result, newEnquiries] = await Promise.all([
      handler(ctx, staffContext),
      // Badge in the admin navigation.
      staffContext.supabase
        .from("enquiries")
        .select("id", { count: "exact", head: true })
        .eq("status", "new")
        .then(({ count }) => count || 0, () => 0),
    ]);
    const output = result || { props: {} };
    if (output.props) {
      output.props = {
        ...output.props,
        notConfigured: false,
        staff: { name: staffContext.profile.full_name, role: staffContext.profile.role },
        counts: { newEnquiries },
      };
    }
    return output;
  };
}

/**
 * For admin API routes. Returns the staff context, or sends an error
 * response and returns null.
 */
export async function requireStaffApi(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!isSameOrigin(req)) {
    sendError(res, 403, "Request not allowed.");
    return null;
  }
  if (!isSupabaseConfigured()) {
    sendError(res, 503, "Supabase is not configured.");
    return null;
  }
  const staffContext = await getStaffContext(req, res);
  if (!staffContext.user) {
    sendError(res, 401, "Please sign in again.");
    return null;
  }
  if (!staffContext.profile) {
    sendError(res, 403, "Your account doesn't have staff access.");
    return null;
  }
  return staffContext;
}
