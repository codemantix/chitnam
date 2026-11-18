import AdminLayout from "@/components/admin/AdminLayout/AdminLayout";
import PostEditor from "@/components/admin/PostEditor/PostEditor";
import { withStaff } from "@/services/auth";
import { getAuthors, getCategories, getPostForEditing } from "@/services/posts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const getServerSideProps = withStaff(async ({ params }, { supabase }) => {
  if (!UUID.test(params.id)) return { notFound: true };
  const [post, categories, authors] = await Promise.all([
    getPostForEditing(supabase, params.id),
    getCategories(supabase),
    getAuthors(supabase),
  ]);
  if (!post) return { notFound: true };
  return { props: { post, categories, authors } };
});

export default function EditPostPage({ staff, notConfigured, counts, post, categories, authors }) {
  return (
    <AdminLayout title="Edit post" eyebrow="Posts" staff={staff} notConfigured={notConfigured} counts={counts}>
      {post && <PostEditor key={post.id} post={post} categories={categories} authors={authors} />}
    </AdminLayout>
  );
}

EditPostPage.getLayout = (page) => page;
