import { getPublicClient } from "@/lib/supabase/publicClient";
import { DEFAULTS, withDefaults } from "@/utils/settings";

/**
 * Reading and writing site settings. Server only.
 * Reads never throw: if the table is missing (migration 0004 not run yet) or
 * Supabase is unreachable, the defaults from config/site.js are returned.
 */

/** Business details for public pages (anon client; RLS allows key = 'business'). */
export async function getBusinessSettings(client = getPublicClient()) {
  return getSetting(client, "business");
}

export async function getSetting(client, key) {
  if (!client) return withDefaults(key, null);
  try {
    const { data, error } = await client.from("settings").select("value").eq("key", key).maybeSingle();
    if (error) return withDefaults(key, null);
    return withDefaults(key, data?.value);
  } catch {
    return withDefaults(key, null);
  }
}

/** All settings for the admin settings page (staff client). */
export async function getAllSettings(client) {
  const entries = await Promise.all(Object.keys(DEFAULTS).map(async (key) => [key, await getSetting(client, key)]));
  return Object.fromEntries(entries);
}

/** Saves one settings object (admin client or service role). */
export async function saveSetting(client, key, value, userId) {
  const { error } = await client
    .from("settings")
    .upsert({ key, value, updated_at: new Date().toISOString(), updated_by: userId || null }, { onConflict: "key" });
  if (error) throw error;
}
