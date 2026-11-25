import { useState } from "react";
import { useRouter } from "next/router";
import SettingsForm, { SettingsError, SettingsInput, SettingsRow, settingsRequest } from "@/components/admin/settings/SettingsForm/SettingsForm";

/** Settings → Profile: the signed-in staff member's own details. */
export default function ProfileSettings({ profile }) {
  const router = useRouter();
  const initial = { fullName: profile.fullName, jobTitle: profile.jobTitle };
  const [saved, setSaved] = useState(initial);
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  const onSave = async () => {
    setErrors({});
    try {
      await settingsRequest("/api/admin/profile/", "PUT", values);
    } catch (error) {
      setErrors(error.fields);
      throw error;
    }
    setSaved(values);
    router.replace(router.asPath, undefined, { scroll: false }); // refresh the name in the sidebar
    return "Your profile has been updated.";
  };

  return (
    <SettingsForm title="Profile" description="How you appear to the rest of the team." dirty={dirty} onSave={onSave} onDiscard={() => setValues(saved)}>
      <SettingsRow label="Full name" htmlFor="profile-name" help="Shown in the admin area and on invitations you send.">
        <SettingsInput id="profile-name" value={values.fullName} maxLength={120} autoComplete="name" onChange={(e) => setValues((v) => ({ ...v, fullName: e.target.value }))} invalid={Boolean(errors.fullName)} />
        <SettingsError>{errors.fullName}</SettingsError>
      </SettingsRow>
      <SettingsRow label="Job title" htmlFor="profile-title" help="Optional, e.g. Admissions adviser.">
        <SettingsInput id="profile-title" value={values.jobTitle} maxLength={80} autoComplete="organization-title" onChange={(e) => setValues((v) => ({ ...v, jobTitle: e.target.value }))} invalid={Boolean(errors.jobTitle)} />
        <SettingsError>{errors.jobTitle}</SettingsError>
      </SettingsRow>
      <SettingsRow label="Email address" htmlFor="profile-email" help="You sign in with this. To change it, ask an administrator.">
        <SettingsInput id="profile-email" value={profile.email} readOnly />
      </SettingsRow>
      <SettingsRow label="Role" help={profile.role === "admin" ? "You can manage the team and site settings." : "Administrators can change roles on the Team page."}>
        <p className="text-[0.9375rem] font-semibold text-ink-900">{profile.role === "admin" ? "Administrator" : "Editor"}</p>
      </SettingsRow>
    </SettingsForm>
  );
}
