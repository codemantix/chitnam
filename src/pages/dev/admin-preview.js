import AdminLayout from "@/components/admin/AdminLayout/AdminLayout";
import PostEditor from "@/components/admin/PostEditor/PostEditor";

/**
 * DEVELOPMENT ONLY — preview of the admin post editor without signing in.
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
const SAMPLE_STAFF = { name: "Preview Staff", role: "admin" };

export async function getStaticProps() {
  const enabled = process.env.NODE_ENV !== "production" || process.env.ENABLE_DEV_PAGES === "true";
  return enabled ? { props: {} } : { notFound: true };
}

export default function AdminPreviewPage() {
  return (
    <AdminLayout title="Add new post" eyebrow="Posts · DEV PREVIEW (sample data)" staff={SAMPLE_STAFF} counts={{ newEnquiries: 3 }}>
      <PostEditor post={null} categories={SAMPLE_CATEGORIES} authors={SAMPLE_AUTHORS} />
    </AdminLayout>
  );
}

AdminPreviewPage.getLayout = (page) => page;
