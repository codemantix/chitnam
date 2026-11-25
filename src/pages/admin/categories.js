import AdminLayout from "@/components/admin/AdminLayout/AdminLayout";
import CategoryManager from "@/components/admin/CategoryManager/CategoryManager";
import Alert from "@/components/ui/Alert/Alert";
import { withStaff } from "@/services/auth";
import { listCategoriesWithCounts } from "@/services/posts";

export const getServerSideProps = withStaff(async (ctx, { supabase }) => {
  try {
    return { props: { categories: await listCategoriesWithCounts(supabase), loadError: false } };
  } catch (error) {
    console.error("[admin] categories:", error.message);
    return { props: { categories: [], loadError: true } };
  }
});

export default function AdminCategoriesPage({ staff, notConfigured, counts, categories = [], loadError }) {
  return (
    <AdminLayout title="Categories" eyebrow="Blog" staff={staff} notConfigured={notConfigured} counts={counts}>
      {loadError ? (
        <Alert tone="error" title="The categories couldn't load. Refresh the page to try again." />
      ) : (
        <CategoryManager initialCategories={categories} />
      )}
    </AdminLayout>
  );
}

AdminCategoriesPage.getLayout = (page) => page;
