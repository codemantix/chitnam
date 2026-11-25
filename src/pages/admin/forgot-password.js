import { useState } from "react";
import AuthLayout from "@/components/admin/AuthLayout/AuthLayout";
import Field from "@/components/forms/Field/Field";
import Alert from "@/components/ui/Alert/Alert";
import Button from "@/components/ui/Button/Button";
import { emailBaseUrl } from "@/lib/http";
import { useHydrated } from "@/hooks/useHydrated";

export async function getServerSideProps({ res }) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  // Reset emails are only sent when a public https site address is configured.
  return { props: { canEmail: emailBaseUrl() !== null } };
}

/** Sends a password reset link. The reply is the same whether or not the account exists. */
export default function ForgotPasswordPage({ canEmail = true }) {
  const hydrated = useHydrated();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("Enter the email address you sign in with.");
      return;
    }
    setStatus("sending");
    setError("");
    // Sent by the server so the emailed link always uses the public site address.
    const response = await fetch("/api/auth/forgot-password/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    }).catch(() => null);
    if (!response) {
      setStatus("idle");
      setError("We couldn't reach the server. Check your connection and try again.");
      return;
    }
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setStatus("idle");
      setError(data.reason === "email-disabled" ? "Password reset emails are only sent from the live website. Ask an administrator for help." : data.message || "Something went wrong. Please try again.");
      return;
    }
    // Show the same message either way, so nobody can test which emails have accounts.
    setStatus("sent");
  };

  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a link to choose a new one.">
      {status === "sent" ? (
        <div className="flex flex-col gap-4">
          <Alert tone="success" title="Check your inbox">
            If {email.trim()} belongs to a staff account, a reset link is on its way. It works once and expires in 24 hours. Check your spam folder if it doesn&rsquo;t arrive in a few minutes.
          </Alert>
          <Button href="/admin/login/" variant="secondary" className="w-full">
            Back to sign in
          </Button>
        </div>
      ) : (
        <form noValidate method="post" onSubmit={onSubmit} className="flex flex-col gap-5">
          {!canEmail && (
            <Alert tone="info" title="Reset emails are only sent from the live website">
              This copy of the site has a local address, and emailed links must always point to the public website. Ask an administrator for help, or use the live site.
            </Alert>
          )}
          {error && <Alert tone="error" title={error} />}
          <Field id="email" type="email" label="Email address" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} data-autofocus />
          <Button type="submit" size="lg" loading={status === "sending"} disabled={!hydrated} className="w-full">
            Send reset link
          </Button>
          <Button href="/admin/login/" variant="ghost" className="w-full">
            Back to sign in
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

ForgotPasswordPage.getLayout = (page) => page;
