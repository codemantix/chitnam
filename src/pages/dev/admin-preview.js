import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout/AdminLayout";
import AssistantCallout from "@/components/admin/AssistantCallout/AssistantCallout";
import CategoryManager from "@/components/admin/CategoryManager/CategoryManager";
import PostEditor from "@/components/admin/PostEditor/PostEditor";
import StatCard from "@/components/admin/StatCard/StatCard";
import TeamManager from "@/components/admin/TeamManager/TeamManager";
import BusinessSettings from "@/components/admin/settings/BusinessSettings/BusinessSettings";
import BlogSettings from "@/components/admin/settings/BlogSettings/BlogSettings";
import EnquirySettings from "@/components/admin/settings/EnquirySettings/EnquirySettings";
import ProfileSettings from "@/components/admin/settings/ProfileSettings/ProfileSettings";
import SecuritySettings from "@/components/admin/settings/SecuritySettings/SecuritySettings";
import SettingsNav from "@/components/admin/settings/SettingsNav/SettingsNav";
import { DEFAULTS } from "@/utils/settings";

/**
 * DEVELOPMENT ONLY — preview of the admin post editor without signing in.
 * Add ?view=dashboard, ?view=categories, ?view=team or ?view=settings&section=…
 * Uses SAMPLE categories/authors (not from the database). Saving and the
 * media library need a real staff session and will show an error here.
 * Returns 404 in production builds unless ENABLE_DEV_PAGES=true.
 */
const SAMPLE_CATEGORIES = [
  { id: "sample-1", name: "Admissions" },
  { id: "sample-2", name: "Studying abroad" },
  { id: "sample-3", name: "Student visas" },
];
const SAMPLE_AUTHORS = [{ id: "sample-author", name: "Chitnam advisory team" }];
const SAMPLE_STAFF = { id: "00000000-0000-4000-8000-0000000000a1", name: "Preview Staff", role: "admin", jobTitle: "Director", email: "preview@example.com" };
const DAY = 86400000;
const NOW = Date.UTC(2026, 10, 24, 12);
const SAMPLE_TEAM = [
  { id: SAMPLE_STAFF.id, fullName: "Preview Staff", email: "preview@example.com", role: "admin", jobTitle: "Director", status: "active", lastSignInAt: new Date(NOW - 3600000).toISOString(), invitedAt: null },
  { id: "00000000-0000-4000-8000-0000000000a2", fullName: "Ada Okoro", email: "ada@example.com", role: "editor", jobTitle: "Admissions adviser", status: "active", lastSignInAt: new Date(NOW - 2 * DAY).toISOString(), invitedAt: null },
  { id: "00000000-0000-4000-8000-0000000000a3", fullName: "Tunde Bello", email: "tunde@example.com", role: "editor", jobTitle: "", status: "invited", lastSignInAt: null, invitedAt: new Date(NOW - 5 * 3600000).toISOString() },
  { id: "00000000-0000-4000-8000-0000000000a4", fullName: "Grace Eze", email: "grace@example.com", role: "admin", jobTitle: "Office manager", status: "expired", lastSignInAt: null, invitedAt: new Date(NOW - 3 * DAY).toISOString() },
];

export async function getStaticProps() {
  const enabled = process.env.NODE_ENV !== "production" || process.env.ENABLE_DEV_PAGES === "true";
  return enabled ? { props: {} } : { notFound: true };
}

export default function AdminPreviewPage() {
  const { query } = useRouter();
  if (query.view === "team") {
    return (
      <AdminLayout title="Team" eyebrow="Workspace · DEV PREVIEW (sample people, actions need sign-in)" staff={SAMPLE_STAFF} counts={{ newEnquiries: 3 }}>
        <TeamManager initialMembers={SAMPLE_TEAM} me={SAMPLE_STAFF} now={NOW} />
      </AdminLayout>
    );
  }
  if (query.view === "settings") {
    const section = query.section || "profile";
    return (
      <AdminLayout title="Settings" eyebrow="Workspace · DEV PREVIEW (saving needs sign-in)" staff={SAMPLE_STAFF} counts={{ newEnquiries: 3 }}>
        <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
          <SettingsNav active={section} isAdmin />
          <div className="min-w-0">
            {section === "profile" && <ProfileSettings profile={{ fullName: "Preview Staff", jobTitle: "Director", email: "preview@example.com", role: "admin" }} />}
            {section === "security" && <SecuritySettings account={{ email: "preview@example.com", lastSignInAt: new Date(NOW - 3600000).toISOString(), createdAt: "2026-11-18T10:00:00Z" }} now={NOW} />}
            {section === "business" && <BusinessSettings value={DEFAULTS.business} />}
            {section === "blog" && <BlogSettings value={DEFAULTS.blog} authors={SAMPLE_AUTHORS} categories={SAMPLE_CATEGORIES.map((c, i) => ({ ...c, id: `00000000-0000-4000-8000-00000000000${i + 1}` }))} aiConfigured={false} />}
            {section === "enquiries" && <EnquirySettings value={DEFAULTS.enquiries} />}
          </div>
        </div>
      </AdminLayout>
    );
  }
  if (query.view === "categories") {
    return (
      <AdminLayout title="Categories" eyebrow="Blog · DEV PREVIEW (sample data, saving needs sign-in)" staff={SAMPLE_STAFF} counts={{ newEnquiries: 3 }}>
        <CategoryManager
          initialCategories={[
            { id: "00000000-0000-4000-8000-000000000001", slug: "admissions", name: "Admissions", description: "Choosing courses and applying to universities abroad.", postCount: 4 },
            { id: "00000000-0000-4000-8000-000000000002", slug: "student-visas", name: "Student visas", description: "Preparing a strong, accurate student visa application.", postCount: 2 },
            { id: "00000000-0000-4000-8000-000000000003", slug: "scholarships", name: "Scholarships", description: null, postCount: 0 },
          ]}
        />
      </AdminLayout>
    );
  }
  if (query.view === "dashboard") {
    return (
      <AdminLayout title="Good morning, Preview" eyebrow="Dashboard · DEV PREVIEW (sample numbers)" staff={SAMPLE_STAFF} counts={{ newEnquiries: 3 }}>
        <div className="flex flex-col gap-6">
          <AssistantCallout />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="New enquiries" value={3} href="#" icon="inbox" tone="green" hint="Waiting for a reply" />
            <StatCard label="In progress" value={5} href="#" icon="phone" tone="amber" hint="Contacted" />
            <StatCard label="Published posts" value={12} href="#" icon="globe" tone="blue" />
            <StatCard label="Drafts" value={2} href="#" icon="posts" tone="slate" />
          </div>
        </div>
      </AdminLayout>
    );
  }
  return (
    <AdminLayout title="Add new post" eyebrow="Posts · DEV PREVIEW (sample data)" staff={SAMPLE_STAFF} counts={{ newEnquiries: 3 }}>
      <PostEditor post={null} categories={SAMPLE_CATEGORIES} authors={SAMPLE_AUTHORS} />
    </AdminLayout>
  );
}

AdminPreviewPage.getLayout = (page) => page;
