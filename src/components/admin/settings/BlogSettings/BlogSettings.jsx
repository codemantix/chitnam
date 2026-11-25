import { useState } from "react";
import SettingsForm, { SettingsRow, settingsRequest } from "@/components/admin/settings/SettingsForm/SettingsForm";
import Toggle from "@/components/admin/settings/Toggle/Toggle";
import styles from "@/components/admin/settings/SettingsForm/SettingsForm.module.css";

const PER_PAGE = [6, 9, 12, 18, 24];

/** Settings → Blog: defaults for new posts, the public blog list and the AI assistant. */
export default function BlogSettings({ value, authors, categories, aiConfigured }) {
  const [saved, setSaved] = useState(value);
  const [values, setValues] = useState(value);
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  const set = (patch) => setValues((v) => ({ ...v, ...patch }));

  const onSave = async () => {
    const result = await settingsRequest("/api/admin/settings/", "PUT", { key: "blog", value: values });
    setSaved(result.value);
    setValues(result.value);
    return "Blog settings saved.";
  };

  return (
    <SettingsForm title="Blog" description="Defaults for new posts and how the public blog lists articles." dirty={dirty} onSave={onSave} onDiscard={() => setValues(saved)}>
      <SettingsRow label="Default author" htmlFor="blog-author" help="Pre-selected as the byline on new posts. Writers can still change it.">
        <select id="blog-author" value={values.defaultAuthorId} onChange={(e) => set({ defaultAuthorId: e.target.value })} className={styles.input}>
          <option value="">First author in the list</option>
          {authors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </SettingsRow>
      <SettingsRow label="Default category" htmlFor="blog-category" help="Pre-selected on new posts.">
        <select id="blog-category" value={values.defaultCategoryId} onChange={(e) => set({ defaultCategoryId: e.target.value })} className={styles.input}>
          <option value="">Uncategorised</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </SettingsRow>
      <SettingsRow label="Articles per page" htmlFor="blog-per-page" help="How many articles the blog shows before the “Show more” button.">
        <select id="blog-per-page" value={values.postsPerPage} onChange={(e) => set({ postsPerPage: Number(e.target.value) })} className={styles.input}>
          {PER_PAGE.map((n) => (
            <option key={n} value={n}>
              {n} articles
            </option>
          ))}
        </select>
      </SettingsRow>
      <SettingsRow label="AI writing assistant" stacked>
        <Toggle
          checked={values.aiAssistantEnabled}
          onChange={(on) => set({ aiAssistantEnabled: on })}
          label="Let the team use the AI writing assistant"
          description={
            aiConfigured
              ? "Drafting, rewriting and title/SEO suggestions in the post editor. Turn off to hide it for everyone."
              : "The assistant also needs its API key on the server before it works (see docs/DEPLOYMENT.md)."
          }
        />
      </SettingsRow>
    </SettingsForm>
  );
}
