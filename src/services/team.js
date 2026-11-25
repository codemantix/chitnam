/**
 * Team management (staff accounts and invitations). SERVER ONLY.
 *
 * Every function takes the service-role client (getAdminClient()). Callers
 * MUST have checked that the signed-in user is an administrator first
 * (requireAdminApi / withStaff + role check).
 *
 * Invitations use Supabase Auth:
 *  - inviteUserByEmail sends Supabase's invite email (configure SMTP and the
 *    template in the Supabase dashboard; see docs/DEPLOYMENT.md);
 *  - generateLink creates a one-time link without sending anything, which an
 *    admin can copy and share (e.g. on WhatsApp) if the email doesn't arrive.
 * Both land on /admin/set-password/, where the new member sets a password.
 */

export const ROLES = {
  admin: { label: "Administrator", description: "Everything, including team members and site settings." },
  editor: { label: "Editor", description: "Posts, categories and enquiries. Can't manage the team or site settings." },
};

/** Supabase's default invite/magic-link lifetime is 24 hours. */
export const INVITE_LIFETIME_MS = 24 * 60 * 60 * 1000;

export class TeamError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

async function listAuthUsers(admin) {
  const users = [];
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 200) break;
  }
  return users;
}

function statusOf(profile, user, now = Date.now()) {
  if (user?.last_sign_in_at || profile.accepted_at) return "active";
  const sent = profile.invited_at ? new Date(profile.invited_at).getTime() : 0;
  if (sent && now - sent > INVITE_LIFETIME_MS) return "expired";
  return "invited";
}

/** Everyone with staff access, plus pending invitations. */
export async function listTeam(admin) {
  const [{ data: profiles, error }, users] = await Promise.all([
    admin.from("staff_profiles").select("*").order("created_at", { ascending: true }),
    listAuthUsers(admin),
  ]);
  if (error) throw error;
  const byId = new Map(users.map((u) => [u.id, u]));
  const names = new Map(profiles.map((p) => [p.id, p.full_name]));
  return profiles.map((p) => {
    const user = byId.get(p.id);
    return {
      id: p.id,
      fullName: p.full_name,
      email: user?.email || p.email || "",
      role: p.role,
      jobTitle: p.job_title || "",
      createdAt: p.created_at,
      invitedAt: p.invited_at || null,
      invitedBy: p.invited_by ? names.get(p.invited_by) || null : null,
      lastSignInAt: user?.last_sign_in_at || null,
      status: statusOf(p, user),
    };
  });
}

async function countAdmins(admin) {
  const { count, error } = await admin.from("staff_profiles").select("id", { count: "exact", head: true }).eq("role", "admin");
  if (error) throw error;
  return count || 0;
}

/** Builds our own accept link from generateLink's hashed token. */
function acceptUrl(origin, properties) {
  const params = new URLSearchParams({ token_hash: properties.hashed_token, type: properties.verification_type || "invite" });
  return `${origin}/admin/set-password/?${params}`;
}

/**
 * Invites a new member.
 * @returns {Promise<{ member: object, emailSent: boolean, link: string|null, emailError: string|null }>}
 */
export async function inviteMember(admin, { email, fullName, role, jobTitle }, { inviterId, origin, emailOrigin, sendEmail }) {
  const normalised = email.trim().toLowerCase();
  // Links that are EMAILED always use the public site address (emailOrigin);
  // links shown to the admin to copy may use the current site's address.
  const redirectTo = `${origin}/admin/set-password/`;

  const { data: existingProfile } = await admin.from("staff_profiles").select("id").ilike("email", normalised).maybeSingle();
  if (existingProfile) throw new TeamError("This person is already on the team.", 409);

  const users = await listAuthUsers(admin);
  const existingUser = users.find((u) => u.email?.toLowerCase() === normalised);

  let userId = existingUser?.id || null;
  let emailSent = false;
  let emailError = null;
  let link = null;

  if (!existingUser && sendEmail && !emailOrigin) {
    emailError = "No email was sent: invitation emails only go out from the live website.";
  } else if (!existingUser && sendEmail) {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(normalised, {
      redirectTo: `${emailOrigin}/admin/set-password/`,
      data: { full_name: fullName },
    });
    if (error) {
      console.error("[team] invite email:", error.message);
      emailError = /rate limit/i.test(error.message)
        ? "Supabase's email limit was reached, so no email was sent."
        : "The invitation email couldn't be sent.";
    } else {
      userId = data.user.id;
      emailSent = true;
    }
  }

  if (!emailSent) {
    // No email (by choice, because it failed, or the account already exists):
    // create a one-time link the admin can share themselves.
    const type = existingUser ? "magiclink" : "invite";
    const { data, error } = await admin.auth.admin.generateLink({ type, email: normalised, options: { redirectTo, data: { full_name: fullName } } });
    if (error) {
      console.error("[team] generate link:", error.message);
      throw new TeamError("The invitation couldn't be created. Please try again.", 502);
    }
    userId = data.user.id;
    link = acceptUrl(origin, data.properties);
  }

  const now = new Date().toISOString();
  const { error: insertError } = await admin.from("staff_profiles").insert({
    id: userId,
    full_name: fullName,
    role,
    job_title: jobTitle || null,
    email: normalised,
    invited_by: inviterId,
    invited_at: now,
  });
  if (insertError) {
    console.error("[team] profile insert:", insertError.message);
    throw new TeamError("The invitation was created but the team record couldn't be saved. Please try again.", 500);
  }

  return {
    member: { id: userId, fullName, email: normalised, role, jobTitle: jobTitle || "", invitedAt: now, status: "invited", lastSignInAt: null },
    emailSent,
    emailError,
    link,
  };
}

async function getProfile(admin, id) {
  const { data, error } = await admin.from("staff_profiles").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) throw new TeamError("Team member not found.", 404);
  return data;
}

/** New one-time link for a pending member (replaces any earlier link). */
export async function createInviteLink(admin, id, origin) {
  const profile = await getProfile(admin, id);
  const { data: userData, error: userError } = await admin.auth.admin.getUserById(id);
  if (userError || !userData?.user) throw new TeamError("Team member not found.", 404);
  if (userData.user.last_sign_in_at) throw new TeamError("This person has already joined. They can reset their password from the sign-in page.", 409);

  const redirectTo = `${origin}/admin/set-password/`;
  const email = userData.user.email;
  // Unconfirmed accounts take an invite link; fall back to a magic link.
  let result = await admin.auth.admin.generateLink({ type: "invite", email, options: { redirectTo } });
  if (result.error) result = await admin.auth.admin.generateLink({ type: "magiclink", email, options: { redirectTo } });
  if (result.error) {
    console.error("[team] invite link:", result.error.message);
    throw new TeamError("A new link couldn't be created. Please try again.", 502);
  }
  await admin.from("staff_profiles").update({ invited_at: new Date().toISOString() }).eq("id", profile.id);
  return acceptUrl(origin, result.data.properties);
}

/** Sends the invitation email again (emailOrigin: the public site address, see lib/http emailBaseUrl). */
export async function resendInvite(admin, id, emailOrigin) {
  if (!emailOrigin) throw new TeamError("Invitation emails only go out from the live website. Copy the invite link and send it yourself instead.", 409);
  const profile = await getProfile(admin, id);
  const { data: userData } = await admin.auth.admin.getUserById(id);
  if (userData?.user?.last_sign_in_at) throw new TeamError("This person has already joined.", 409);
  const { error } = await admin.auth.admin.inviteUserByEmail(userData?.user?.email || profile.email, {
    redirectTo: `${emailOrigin}/admin/set-password/`,
    data: { full_name: profile.full_name },
  });
  if (error) {
    console.error("[team] resend:", error.message);
    throw new TeamError(
      /rate limit/i.test(error.message)
        ? "Supabase's email limit was reached. Copy the invite link and send it yourself instead."
        : "The email couldn't be sent. Copy the invite link and send it yourself instead.",
      502
    );
  }
  await admin.from("staff_profiles").update({ invited_at: new Date().toISOString() }).eq("id", id);
}

export async function updateMember(admin, id, { role, jobTitle }, actorId) {
  const profile = await getProfile(admin, id);
  if (role && role !== profile.role && profile.role === "admin" && (await countAdmins(admin)) <= 1) {
    throw new TeamError("There must be at least one administrator. Make someone else an administrator first.", 409);
  }
  if (role && role !== profile.role && id === actorId && role !== "admin" && (await countAdmins(admin)) <= 1) {
    throw new TeamError("You're the only administrator, so you can't change your own role.", 409);
  }
  const changes = {};
  if (role) changes.role = role;
  if (jobTitle !== undefined) changes.job_title = jobTitle || null;
  const { error } = await admin.from("staff_profiles").update(changes).eq("id", id);
  if (error) throw error;
}

/** Removes access completely: deletes the login (the profile cascades). */
export async function removeMember(admin, id, actorId) {
  if (id === actorId) throw new TeamError("You can't remove yourself. Ask another administrator.", 409);
  const profile = await getProfile(admin, id);
  if (profile.role === "admin" && (await countAdmins(admin)) <= 1) {
    throw new TeamError("You can't remove the only administrator.", 409);
  }
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) {
    console.error("[team] delete user:", error.message);
    throw new TeamError("Access couldn't be removed. Please try again.", 502);
  }
}
