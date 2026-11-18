import AdminLayout from "@/components/admin/AdminLayout/AdminLayout";
import PostEditor from "@/components/admin/PostEditor/PostEditor";
import { withStaff } from "@/services/auth";
import { getAuthors, getCategories } from "@/services/posts";

export const getServerSideProps = withStaff(async (ctx, { supabase }) => {
  const [categories, authors] = await Promise.all([getCategories(supabase), getAuthors(supabase)]);
  return { props: { categories, authors } };
});

export default function NewPostPage({ staff, notConfigured, counts, categories, authors }) {
  return (
    <AdminLayout title="Add new post" eyebrow="Posts" staff={staff} notConfigured={notConfigured} counts={counts}>
      {!notConfigured && <PostEditor post={null} categories={categories} authors={authors} />}
    </AdminLayout>
  );
}

NewPostPage.getLayout = (page) => page;
