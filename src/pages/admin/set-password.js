import { useEffect, useState } from "react";
import AuthLayout from "@/components/admin/AuthLayout/AuthLayout";
import PasswordFields, { passwordProblem } from "@/components/admin/PasswordFields/PasswordFields";
import Field from "@/components/forms/Field/Field";
import Alert from "@/components/ui/Alert/Alert";
import Button from "@/components/ui/Button/Button";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBrowserClient } from "@/lib/supabase/browserClient";
import { getServerClient } from "@/lib/supabase/serverClient";
import { useHydrated } from "@/hooks/useHydrated";

const OTP_TYPES = ["invite", "magiclink", "recovery", "signup", "email"];

/**
 * Lands here from:
 *  - a team invitation (email from Supabase, or a copied one-time link)
 *  - a "forgot password" email
 * The link signs the person in once; they then choose a password.
 *
 * Link formats handled:
 *  - ?token_hash=…&type=…   (links built by the admin, or custom email templates) → verified on the server
 *  - ?code=…                (password reset started in this browser, PKCE)        → exchanged on the server
 *  - #access_token=…        (Supabase's default invite email)                      → read in the browser
 */
export async function getServerSideProps({ req, res, query, resolvedUrl }) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("Referrer-Policy", "no-referrer"); // never leak tokens in the Referer header
  if (!isSupabaseConfigured()) return { props: { state: "not-configured" } };

  const supabase = getServerClient(req, res);
  const mode = query.mode === "reset" || query.type === "recovery" ? "reset" : "invite";
  if (query.expired === "1") return { props: { state: "invalid", mode } };
  const clean = `/admin/set-password/${mode === "reset" ? "?mode=reset" : ""}`;

  // One-time token in the query: verify, set the session cookie, then reload
  // without the token so it isn't kept in history or reused.
  if (typeof query.token_hash === "string" && OTP_TYPES.includes(query.type)) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: query.token_hash, type: query.type });
    // Expired or used: reload without the token in the address bar.
    if (error) return { redirect: { destination: `/admin/set-password/?expired=1${mode === "reset" ? "&mode=reset" : ""}`, permanent: false } };
    return { redirect: { destination: clean, permanent: false } };
  }
  if (typeof query.code === "string") {
    const { error } = await supabase.auth.exchangeCodeForSession(query.code);
    if (error) return { redirect: { destination: `/admin/set-password/?expired=1${mode === "reset" ? "&mode=reset" : ""}`, permanent: false } };
    return { redirect: { destination: clean, permanent: false } };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { props: { state: "needs-link", mode } };

  const { data: profile } = await supabase.from("staff_profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) return { props: { state: "revoked", mode } };

  return {
    props: {
      state: "ready",
      mode: resolvedUrl.includes("mode=reset") ? "reset" : profile.accepted_at ? "reset" : "invite",
      email: user.email || "",
      fullName: profile.full_name || "",
    },
  };
}

export default function SetPasswordPage({ state, mode, email = "", fullName: initialName = "" }) {
  const hydrated = useHydrated();
  const [fullName, setFullName] = useState(initialName);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  // Supabase's default invite email puts the session in the URL fragment,
  // which the server never sees. Read it here, store the session, reload.
  // Every outcome is a full reload, so the server decides what to show.
  useEffect(() => {
    if (state !== "needs-link") return;
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const reset = params.get("type") === "recovery" || mode === "reset";
    const expired = `/admin/set-password/?expired=1${reset ? "&mode=reset" : ""}`;
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (params.get("error_code") || params.get("error") || !access_token || !refresh_token) {
      window.location.replace(expired);
      return;
    }
    getBrowserClient()
      .auth.setSession({ access_token, refresh_token })
      .then(({ error: sessionError }) => window.location.replace(sessionError ? expired : `/admin/set-password/${reset ? "?mode=reset" : ""}`));
  }, [state, mode]);

  const isInvite = mode !== "reset";
  const title = isInvite ? "Join the team" : "Choose a new password";
  const subtitle = isInvite ? "Set up your account for the Chitnam website admin." : "Pick a strong password you don't use anywhere else.";

  const onSubmit = async (event) => {
    event.preventDefault();
    const problem = (isInvite && fullName.trim().length < 2 && "Enter your full name.") || passwordProblem(password, email) || (password !== confirm && "The two passwords don't match.");
    if (problem) {
      setError(problem);
      return;
    }
    setStatus("saving");
    setError("");
    const supabase = getBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password, data: isInvite ? { full_name: fullName.trim() } : undefined });
    if (updateError) {
      console.error("[set-password] updateUser:", updateError.status, updateError.code, updateError.message);
      setStatus("idle");
      setError(
        /same|different/i.test(updateError.message)
          ? "Choose a password you haven't used for this account before."
          : /weak|pwned|leaked/i.test(updateError.message)
            ? "That password is too easy to guess or has appeared in a data breach. Choose another."
            : "Your password couldn't be saved. The link may have expired; ask for a new one."
      );
      return;
    }
    // Record the name and that the invitation was accepted.
    await fetch("/api/admin/profile/", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isInvite ? { fullName: fullName.trim(), accept: true } : { accept: true }),
    }).catch(() => null);
    setStatus("done");
    // Full page load so the server reads the refreshed session cookie.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/admin/");
  };

  if (state === "not-configured") {
    return (
      <AuthLayout title="Set your password">
        <Alert tone="warning" title="Supabase isn't connected yet." />
      </AuthLayout>
    );
  }

  if (state === "invalid") {
    return (
      <AuthLayout title="This link has expired" subtitle="Links work once and only for 24 hours.">
        <div className="flex flex-col gap-4">
          <Alert tone="warning" title={isInvite ? "Ask an administrator to send you a new invitation." : "Request a new reset link and use it straight away."} />
          <Button href={isInvite ? "/admin/login/" : "/admin/forgot-password/"} variant="secondary" className="w-full">
            {isInvite ? "Go to sign in" : "Send a new reset link"}
          </Button>
        </div>
      </AuthLayout>
    );
  }

  if (state === "needs-link") {
    return (
      <AuthLayout title="Checking your link…">
        <p className="text-center text-sm text-ink-600" role="status">
          One moment.
        </p>
      </AuthLayout>
    );
  }

  if (state === "revoked") {
    return (
      <AuthLayout title="No access" subtitle="This account isn't on the team any more.">
        <Alert tone="warning" title="Ask an administrator if you think this is a mistake." />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      <form noValidate method="post" onSubmit={onSubmit} className="flex flex-col gap-5">
        {error && <Alert tone="error" title={error} />}
        <div className="flex flex-col gap-1 rounded-2xl bg-[var(--admin-muted)] px-4 py-3 text-sm">
          <span className="text-ink-600">Signing in as</span>
          <span className="font-semibold break-all text-ink-900">{email}</span>
        </div>
        {isInvite && <Field id="fullName" label="Your full name" required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={120} />}
        <PasswordFields password={password} confirm={confirm} onPassword={setPassword} onConfirm={setConfirm} email={email} />
        {/* Hidden username field helps password managers save the right login. */}
        <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
        <Button type="submit" size="lg" loading={status !== "idle"} disabled={!hydrated} className="w-full">
          {isInvite ? "Create account" : "Save new password"}
        </Button>
      </form>
    </AuthLayout>
  );
}

SetPasswordPage.getLayout = (page) => page;
