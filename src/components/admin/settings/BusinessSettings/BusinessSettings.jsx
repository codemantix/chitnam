import { useState } from "react";
import SettingsForm, { SettingsError, SettingsInput, SettingsRow, settingsRequest } from "@/components/admin/settings/SettingsForm/SettingsForm";
import Icon from "@/components/ui/Icon/Icon";
import { formatAddress, SOCIAL_NETWORKS, validateBusiness } from "@/utils/settings";
import styles from "./BusinessSettings.module.css";

/** Settings → Business details: shown in the header, footer, contact page and search results. */
export default function BusinessSettings({ value }) {
  const [saved, setSaved] = useState(value);
  const [values, setValues] = useState(value);
  const [errors, setErrors] = useState({});
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  const set = (patch) => setValues((v) => ({ ...v, ...patch }));
  const setAddress = (key, val) => setValues((v) => ({ ...v, address: { ...v.address, [key]: val } }));
  const setSocial = (key, val) => setValues((v) => ({ ...v, social: { ...v.social, [key]: val } }));
  const setPhone = (index, patch) => setValues((v) => ({ ...v, phones: v.phones.map((p, i) => (i === index ? { ...p, ...patch } : p)) }));
  const addPhone = () => setValues((v) => ({ ...v, phones: [...v.phones, { display: "", tel: "", label: "" }] }));
  const removePhone = (index) => setValues((v) => ({ ...v, phones: v.phones.filter((_, i) => i !== index) }));

  const onSave = async () => {
    const { errors: clientErrors } = validateBusiness(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) throw new Error("Please correct the highlighted fields.");
    try {
      const result = await settingsRequest("/api/admin/settings/", "PUT", { key: "business", value: values });
      setSaved(result.value);
      setValues(result.value);
      const failed = result.refreshed?.failed;
      return failed ? "Saved. A few pages will show the new details within the hour." : "Saved. The website now shows the new details.";
    } catch (error) {
      setErrors(error.fields);
      throw error;
    }
  };

  return (
    <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:items-start">
      <SettingsForm
        title="Business details"
        description="Shown in the website header, footer, contact page, privacy policy and Google search results. Changes go live as soon as you save."
        dirty={dirty}
        onSave={onSave}
        onDiscard={() => {
          setValues(saved);
          setErrors({});
        }}
      >
        <SettingsRow label="Email address" htmlFor="biz-email" help="Where students can email you.">
          <SettingsInput id="biz-email" type="email" value={values.email} onChange={(e) => set({ email: e.target.value })} invalid={Boolean(errors.email)} autoComplete="off" />
          <SettingsError>{errors.email}</SettingsError>
        </SettingsRow>

        <SettingsRow label="Phone numbers" help="The first number is used on buttons such as “Call us”. Add a label for numbers outside Nigeria, e.g. UK.">
          <ul className="flex flex-col gap-2">
            {values.phones.map((phone, index) => (
              <li key={index} className="flex flex-col gap-1">
                <div className="flex max-w-[32rem] gap-2">
                  <label className="sr-only" htmlFor={`phone-${index}`}>
                    Phone number {index + 1}
                  </label>
                  <SettingsInput id={`phone-${index}`} type="tel" value={phone.display} placeholder="0803 123 4567" onChange={(e) => setPhone(index, { display: e.target.value })} invalid={Boolean(errors[`phone${index}`])} />
                  <label className="sr-only" htmlFor={`phone-label-${index}`}>
                    Label for phone number {index + 1}
                  </label>
                  <SettingsInput id={`phone-label-${index}`} value={phone.label} placeholder="Label" onChange={(e) => setPhone(index, { label: e.target.value })} style={{ maxWidth: "7.5rem" }} maxLength={20} />
                  {values.phones.length > 1 && (
                    <button type="button" onClick={() => removePhone(index)} className={styles.remove} title="Remove this number">
                      <Icon name="trash" size={16} />
                      <span className="sr-only">Remove phone number {index + 1}</span>
                    </button>
                  )}
                </div>
                <SettingsError>{errors[`phone${index}`]}</SettingsError>
              </li>
            ))}
          </ul>
          {values.phones.length < 5 && (
            <button type="button" onClick={addPhone} className={styles.add}>
              <Icon name="plus" size={16} /> Add another number
            </button>
          )}
          <SettingsError>{errors.phones}</SettingsError>
        </SettingsRow>

        <SettingsRow label="WhatsApp" htmlFor="biz-whatsapp" help="Optional. With country code. Adds a “Message us on WhatsApp” link to the contact page.">
          <SettingsInput id="biz-whatsapp" type="tel" value={values.whatsapp} placeholder="+234 803 123 4567" onChange={(e) => set({ whatsapp: e.target.value })} invalid={Boolean(errors.whatsapp)} />
          <SettingsError>{errors.whatsapp}</SettingsError>
        </SettingsRow>

        <SettingsRow label="Office hours" htmlFor="biz-hours" help="Optional, e.g. “Monday to Friday, 9am to 5pm”.">
          <SettingsInput id="biz-hours" value={values.officeHours} maxLength={120} onChange={(e) => set({ officeHours: e.target.value })} />
        </SettingsRow>

        <SettingsRow label="Office address" help="Used for the map link and in search results, so keep it exact.">
          <div className="grid max-w-[32rem] gap-2">
            <label className="sr-only" htmlFor="biz-street">Street</label>
            <SettingsInput id="biz-street" value={values.address.street} placeholder="Street and number" onChange={(e) => setAddress("street", e.target.value)} invalid={Boolean(errors.street)} />
            <SettingsError>{errors.street}</SettingsError>
            <label className="sr-only" htmlFor="biz-locality">Area</label>
            <SettingsInput id="biz-locality" value={values.address.locality} placeholder="Area / neighbourhood" onChange={(e) => setAddress("locality", e.target.value)} />
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="sr-only" htmlFor="biz-city">City</label>
                <SettingsInput id="biz-city" value={values.address.city} placeholder="City" onChange={(e) => setAddress("city", e.target.value)} invalid={Boolean(errors.city)} />
                <SettingsError>{errors.city}</SettingsError>
              </div>
              <div>
                <label className="sr-only" htmlFor="biz-region">State</label>
                <SettingsInput id="biz-region" value={values.address.region} placeholder="State" onChange={(e) => setAddress("region", e.target.value)} />
              </div>
            </div>
          </div>
        </SettingsRow>

        <SettingsRow label="Social media" help="Full links to your pages. Leave empty to hide a network.">
          <div className="grid max-w-[32rem] gap-2">
            {SOCIAL_NETWORKS.map((network) => (
              <div key={network.key} className="flex flex-col gap-1">
                <div className={styles.socialRow}>
                  <label htmlFor={`social-${network.key}`} className={styles.socialLabel}>
                    {network.label}
                  </label>
                  <SettingsInput id={`social-${network.key}`} type="url" value={values.social[network.key] || ""} placeholder="https://" onChange={(e) => setSocial(network.key, e.target.value)} invalid={Boolean(errors[`social_${network.key}`])} />
                </div>
                <SettingsError>{errors[`social_${network.key}`]}</SettingsError>
              </div>
            ))}
          </div>
        </SettingsRow>
      </SettingsForm>

      {/* Live preview of the contact block. */}
      <aside className={styles.preview} aria-label="Preview">
        <p className={styles.previewLabel}>Preview · contact page</p>
        <dl className="flex flex-col gap-3 text-sm">
          <div>
            <dt className={styles.previewTerm}>Visit</dt>
            <dd>{formatAddress(values.address) || "—"}</dd>
          </div>
          <div>
            <dt className={styles.previewTerm}>Call</dt>
            {values.phones.filter((p) => p.display).map((p, i) => (
              <dd key={i} className="font-semibold">
                {p.display} {p.label && <span className="font-normal text-ink-600">({p.label})</span>}
              </dd>
            ))}
          </div>
          <div>
            <dt className={styles.previewTerm}>Email</dt>
            <dd className="font-semibold break-all">{values.email || "—"}</dd>
          </div>
          {values.officeHours && (
            <div>
              <dt className={styles.previewTerm}>Office hours</dt>
              <dd>{values.officeHours}</dd>
            </div>
          )}
          <div>
            <dt className={styles.previewTerm}>Follow</dt>
            <dd className="flex flex-wrap gap-1.5">
              {SOCIAL_NETWORKS.filter((n) => values.social[n.key]).map((n) => (
                <span key={n.key} className={styles.chip}>
                  {n.label}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
