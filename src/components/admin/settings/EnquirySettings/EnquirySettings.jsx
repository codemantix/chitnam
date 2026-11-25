import { useState } from "react";
import SettingsForm, { SettingsRow, settingsRequest } from "@/components/admin/settings/SettingsForm/SettingsForm";
import Toggle from "@/components/admin/settings/Toggle/Toggle";
import styles from "@/components/admin/settings/SettingsForm/SettingsForm.module.css";

const AUTO_CLOSE = [
  [0, "Never"],
  [14, "After 14 days"],
  [30, "After 30 days"],
  [60, "After 60 days"],
  [90, "After 90 days"],
];
const RETENTION = [
  [0, "Keep until deleted by hand"],
  [6, "After 6 months"],
  [12, "After 12 months"],
  [24, "After 2 years"],
  [36, "After 3 years"],
];

/** Settings → Enquiries: the website forms and how long enquiries are kept. */
export default function EnquirySettings({ value }) {
  const [saved, setSaved] = useState(value);
  const [values, setValues] = useState(value);
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  const set = (patch) => setValues((v) => ({ ...v, ...patch }));

  const onSave = async () => {
    const result = await settingsRequest("/api/admin/settings/", "PUT", { key: "enquiries", value: values });
    setSaved(result.value);
    setValues(result.value);
    return "Enquiry settings saved.";
  };

  return (
    <SettingsForm
      title="Enquiries"
      description="How the website forms behave and how long enquiries are kept. Enquiries contain personal data, so keep them only as long as you need them (Nigeria Data Protection Act 2023)."
      dirty={dirty}
      onSave={onSave}
      onDiscard={() => setValues(saved)}
    >
      <SettingsRow label="Contact form" stacked>
        <Toggle
          checked={values.requirePhoneOnContact}
          onChange={(on) => set({ requirePhoneOnContact: on })}
          label="Require a phone number on the contact form"
          description="The Apply now form always asks for one. Making it required on the contact form too means fewer, but easier to follow up, messages."
        />
      </SettingsRow>
      <SettingsRow label="Close old enquiries" htmlFor="enq-close" help="Enquiries marked “Contacted” are moved to “Closed” this long after they arrived, keeping the inbox tidy.">
        <select id="enq-close" value={values.autoCloseAfterDays} onChange={(e) => set({ autoCloseAfterDays: Number(e.target.value) })} className={styles.input}>
          {AUTO_CLOSE.map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </SettingsRow>
      <SettingsRow label="Delete closed enquiries" htmlFor="enq-delete" help="Closed enquiries are permanently deleted this long after they arrived. Deleted enquiries can't be recovered.">
        <select id="enq-delete" value={values.deleteClosedAfterMonths} onChange={(e) => set({ deleteClosedAfterMonths: Number(e.target.value) })} className={styles.input}>
          {RETENTION.map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </SettingsRow>
    </SettingsForm>
  );
}
