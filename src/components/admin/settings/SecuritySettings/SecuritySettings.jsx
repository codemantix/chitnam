import { useState } from "react";
import Card from "@/components/admin/Card/Card";
import PasswordFields, { passwordProblem } from "@/components/admin/PasswordFields/PasswordFields";
import SettingsForm, { SettingsInput, SettingsRow } from "@/components/admin/settings/SettingsForm/SettingsForm";
import Alert from "@/components/ui/Alert/Alert";
import Button from "@/components/ui/Button/Button";
import { getBrowserClient } from "@/lib/supabase/browserClient";
import { formatDate, formatRelative } from "@/utils/date";
import { useConfirm } from "@/components/admin/ConfirmDialog/ConfirmDialog";

/** Settings → Password & security. */
export default function SecuritySettings({ account, now }) {
  const askConfirm = useConfirm();
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [sessionNotice, setSessionNotice] = useState(null);
  const [signingOut, setSigningOut] = useState(null);
  const dirty = Boolean(current || password || confirm);

  const onSave = async () => {
    if (!current) throw new Error("Enter your current password.");
    const problem = passwordProblem(password, account.email) || (password !== confirm && "The two new passwords don't match.") || (password === current && "Choose a password that's different from your current one.");
    if (problem) throw new Error(problem);

    const supabase = getBrowserClient();
    // Confirm it's really you before changing the password.
    const { error: checkError } = await supabase.auth.signInWithPassword({ email: account.email, password: current });
    if (checkError) throw new Error("Your current password isn't right.");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      throw new Error(/weak|pwned|leaked/i.test(error.message) ? "That password is too easy to guess or has appeared in a data breach. Choose another." : "Your password couldn't be changed. Please try again.");
    }
    setCurrent("");
    setPassword("");
    setConfirm("");
    return "Password changed. Use the new one next time you sign in.";
  };

  const signOut = async (scope) => {
    const ok = await askConfirm(
      scope === "others"
        ? {
            tone: "warning",
            icon: "logout",
            title: "Sign out of other devices?",
            message: "Every other phone, tablet and computer signed in to your account is signed out. You stay signed in here.",
            confirmLabel: "Sign out other devices",
          }
        : {
            tone: "warning",
            icon: "logout",
            title: "Sign out everywhere?",
            message: "You'll be signed out on every device, including this one, and will need your password to sign in again.",
            confirmLabel: "Sign out everywhere",
          }
    );
    if (!ok) return;
    setSigningOut(scope);
    setSessionNotice(null);
    const { error } = await getBrowserClient().auth.signOut({ scope });
    setSigningOut(null);
    if (error) {
      setSessionNotice({ tone: "error", text: "That didn't work. Please try again." });
      return;
    }
    if (scope === "global") {
      window.location.replace("/admin/login/");
      return;
    }
    setSessionNotice({ tone: "success", text: "You've been signed out of all other devices." });
  };

  return (
    <div className="flex flex-col gap-6">
      <SettingsForm
        title="Change password"
        description="Use at least 10 characters with letters and numbers. A password manager makes this easy."
        dirty={dirty}
        onSave={onSave}
        onDiscard={() => {
          setCurrent("");
          setPassword("");
          setConfirm("");
        }}
        saveLabel="Update password"
      >
        <input type="email" name="username" autoComplete="username" value={account.email} readOnly hidden />
        <SettingsRow label="Current password" htmlFor="current-password">
          <SettingsInput id="current-password" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </SettingsRow>
        <SettingsRow label="New password" help="You'll stay signed in on this device.">
          <div className="max-w-[32rem]">
            <PasswordFields password={password} confirm={confirm} onPassword={setPassword} onConfirm={setConfirm} email={account.email} />
          </div>
        </SettingsRow>
      </SettingsForm>

      <Card title="Where you're signed in" description="If you've used a shared or lost device, sign out of it here.">
        <div className="flex flex-col gap-4">
          {sessionNotice && <Alert tone={sessionNotice.tone} title={sessionNotice.text} />}
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-ink-600">Account</dt>
              <dd className="font-semibold break-all text-ink-900">{account.email}</dd>
            </div>
            <div>
              <dt className="text-ink-600">Last sign-in</dt>
              <dd className="font-semibold text-ink-900" title={formatDate(account.lastSignInAt)}>
                {account.lastSignInAt ? formatRelative(account.lastSignInAt, now) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-ink-600">Member since</dt>
              <dd className="font-semibold text-ink-900">{formatDate(account.createdAt) || "—"}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={() => signOut("others")} loading={signingOut === "others"} disabled={Boolean(signingOut)}>
              Sign out of other devices
            </Button>
            <Button type="button" variant="ghost" onClick={() => signOut("global")} loading={signingOut === "global"} disabled={Boolean(signingOut)}>
              Sign out everywhere
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
