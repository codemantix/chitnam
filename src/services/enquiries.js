/**
 * Enquiry data access. Server only.
 *
 * Public submissions are inserted with the service-role client (the public
 * has no insert policy). Staff reads/updates use the request-scoped client,
 * so Row Level Security decides what they can see.
 */

const LIST_COLUMNS =
  "id, created_at, source, full_name, email, phone, destination, study_level, field_of_interest, interest, message, status, staff_notes";

/** @param {import('@supabase/supabase-js').SupabaseClient} adminClient */
export async function insertEnquiry(adminClient, record) {
  const { error } = await adminClient.from("enquiries").insert(record);
  if (error) throw new Error(`Could not save enquiry: ${error.message}`);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} client Request-scoped (staff) client.
 * @param {{ status?: string, limit?: number }} [options]
 */
export async function listEnquiries(client, { status, limit = 200 } = {}) {
  let query = client.from("enquiries").select(LIST_COLUMNS).order("created_at", { ascending: false }).limit(limit);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function countEnquiriesByStatus(client) {
  const counts = {};
  for (const status of ["new", "contacted", "closed"]) {
    const { count, error } = await client
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", status);
    if (error) throw new Error(error.message);
    counts[status] = count || 0;
  }
  return counts;
}

export async function updateEnquiry(client, id, { status, staffNotes }) {
  const patch = {};
  if (status) patch.status = status;
  if (staffNotes !== undefined) patch.staff_notes = staffNotes || null;
  const { error } = await client.from("enquiries").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}
