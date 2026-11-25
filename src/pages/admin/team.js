import AdminLayout from "@/components/admin/AdminLayout/AdminLayout";
import TeamManager from "@/components/admin/TeamManager/TeamManager";
import Alert from "@/components/ui/Alert/Alert";
import { emailBaseUrl } from "@/lib/http";
import { getAdminClient } from "@/lib/supabase/adminClient";
import { withStaff } from "@/services/auth";
import { listTeam } from "@/services/team";

// Every staff member can see who is on the team; only administrators get
// the invite / role / remove controls (and the APIs enforce the same rule).
export const getServerSideProps = withStaff(async () => {
  const admin = getAdminClient();
  // Invitation emails are only sent when a public https site address is configured.
  const canEmail = emailBaseUrl() !== null;
  if (!admin) return { props: { members: [], loadError: "missing-key", now: Date.now(), canEmail } };
  try {
    return { props: { members: await listTeam(admin), loadError: null, now: Date.now(), canEmail } };
  } catch (error) {
    console.error("[admin] team:", error.message);
    return { props: { members: [], loadError: "failed", now: Date.now(), canEmail } };
  }
});

export default function AdminTeamPage({ staff, notConfigured, counts, members = [], loadError, now, canEmail = false }) {
  return (
    <AdminLayout title="Team" eyebrow="Workspace" staff={staff} notConfigured={notConfigured} counts={counts}>
      {loadError === "missing-key" ? (
        <Alert tone="warning" title="The server is missing SUPABASE_SERVICE_ROLE_KEY, which team management needs." />
      ) : loadError ? (
        <Alert tone="error" title="The team couldn't load. Refresh the page to try again." />
      ) : (
        staff && <TeamManager initialMembers={members} me={staff} now={now} canEmail={canEmail} />
      )}
    </AdminLayout>
  );
}

AdminTeamPage.getLayout = (page) => page;
