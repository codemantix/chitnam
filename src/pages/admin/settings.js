import AdminLayout from "@/components/admin/AdminLayout/AdminLayout";
import BlogSettings from "@/components/admin/settings/BlogSettings/BlogSettings";
import BusinessSettings from "@/components/admin/settings/BusinessSettings/BusinessSettings";
import EnquirySettings from "@/components/admin/settings/EnquirySettings/EnquirySettings";
import ProfileSettings from "@/components/admin/settings/ProfileSettings/ProfileSettings";
import SecuritySettings from "@/components/admin/settings/SecuritySettings/SecuritySettings";
import SettingsNav, { SETTINGS_SECTIONS } from "@/components/admin/settings/SettingsNav/SettingsNav";
import { isGeminiConfigured } from "@/lib/gemini";
import { withStaff } from "@/services/auth";
import { getAuthors, getCategories } from "@/services/posts";
import { getAllSettings } from "@/services/settings";

export const getServerSideProps = withStaff(async ({ query }, { supabase, user, profile }) => {
  const isAdmin = profile.role === "admin";
  const requested = SETTINGS_SECTIONS.find((s) => s.id === query.section);
  // Editors only see their own account sections.
  const section = requested && (isAdmin || !requested.adminOnly) ? requested.id : "profile";

  const props = {
    section,
    now: Date.now(),
    profile: { fullName: profile.full_name, jobTitle: profile.job_title || "", email: user.email || "", role: profile.role },
    account: { email: user.email || "", lastSignInAt: user.last_sign_in_at || null, createdAt: user.created_at || null },
  };

  if (isAdmin && ["business", "blog", "enquiries"].includes(section)) {
    const [settings, authors, categories] = await Promise.all([
      getAllSettings(supabase),
      section === "blog" ? getAuthors(supabase) : [],
      section === "blog" ? getCategories(supabase) : [],
    ]);
    props.settings = settings;
    props.authors = authors;
    props.categories = categories;
    props.aiConfigured = isGeminiConfigured();
  }
  return { props };
});

export default function AdminSettingsPage({ staff, notConfigured, counts, section, now, profile, account, settings, authors = [], categories = [], aiConfigured = false }) {
  const isAdmin = staff?.role === "admin";
  return (
    <AdminLayout title="Settings" eyebrow="Workspace" staff={staff} notConfigured={notConfigured} counts={counts}>
      {staff && (
        <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
          <SettingsNav active={section} isAdmin={isAdmin} />
          <div className="min-w-0">
            {/* key: remount when switching sections so unsaved state never leaks across. */}
            {section === "profile" && <ProfileSettings key="profile" profile={profile} />}
            {section === "security" && <SecuritySettings key="security" account={account} now={now} />}
            {section === "business" && settings && <BusinessSettings key="business" value={settings.business} />}
            {section === "blog" && settings && <BlogSettings key="blog" value={settings.blog} authors={authors} categories={categories} aiConfigured={aiConfigured} />}
            {section === "enquiries" && settings && <EnquirySettings key="enquiries" value={settings.enquiries} />}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

AdminSettingsPage.getLayout = (page) => page;
