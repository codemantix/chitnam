import { useState } from "react";
import { useRouter } from "next/router";
import AuthLayout from "@/components/admin/AuthLayout/AuthLayout";
import Field from "@/components/forms/Field/Field";
import Alert from "@/components/ui/Alert/Alert";
import Button from "@/components/ui/Button/Button";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBrowserClient } from "@/lib/supabase/browserClient";
import { getStaffContext } from "@/services/auth";

/** Only allow redirects back into the admin area (prevents open redirects). */
const safeNext = (next) => (typeof next === "string" && /^\/admin\/(?!\/)/.test(next) ? next : "/admin/");

export async function getServerSideProps({ req, res, query }) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  if (!isSupabaseConfigured()) return { props: { notConfigured: true, notStaff: false } };

  // Already signed in as staff → straight to the dashboard.
  const { user, profile } = await getStaffContext(req, res);
  if (user && profile) return { redirect: { destination: safeNext(query.next), permanent: false } };

  return { props: { notConfigured: false, notStaff: Boolean(user) || query.error === "not-staff" } };
}

export default function AdminLoginPage({ notConfigured, notStaff }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState(
    notStaff ? "This account doesn't have staff access. Ask an administrator to add you." : ""
  );

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      setStatus("error");
      setMessage("Enter your email address and password.");
      return;
    }
    setStatus("submitting");
    setMessage("");
    const { error } = await getBrowserClient().auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setStatus("error");
      // Same message for a wrong email or password, so accounts can't be probed.
      setMessage("That email and password combination didn't work. Please try again.");
      return;
    }
    // Full navigation so the server reads the new session cookie.
    window.location.assign(safeNext(router.query.next));
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage articles and enquiries.">
      {notConfigured ? (
        <Alert tone="warning" title="Supabase isn't connected yet">
          Add the Supabase environment variables and reload. See the README.
        </Alert>
      ) : (
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
          {message && <Alert tone="error" title={message} />}
          <Field
            id="email"
            type="email"
            label="Email address"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            id="password"
            type="password"
            label="Password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" size="lg" loading={status === "submitting"} className="mt-1 w-full">
            {status === "submitting" ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-xs text-ink-600">
            Forgotten your password? Ask an administrator to send a reset link from Supabase.
          </p>
        </form>
      )}
    </AuthLayout>
  );
}

AdminLoginPage.getLayout = (page) => page;
