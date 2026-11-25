import AdminLayout from "@/components/admin/AdminLayout/AdminLayout";
import PostEditor from "@/components/admin/PostEditor/PostEditor";
import { withStaff } from "@/services/auth";
import { getAuthors, getCategories } from "@/services/posts";
import { getSetting } from "@/services/settings";

export const getServerSideProps = withStaff(async (ctx, { supabase }) => {
  const [categories, authors, blog] = await Promise.all([getCategories(supabase), getAuthors(supabase), getSetting(supabase, "blog")]);
  // Settings → Blog: pre-select the default author and category.
  const defaults = {
    authorId: authors.some((a) => a.id === blog.defaultAuthorId) ? blog.defaultAuthorId : "",
    categoryId: categories.some((c) => c.id === blog.defaultCategoryId) ? blog.defaultCategoryId : "",
  };
  return { props: { categories, authors, defaults } };
});

export default function NewPostPage({ staff, notConfigured, counts, categories, authors, defaults }) {
  return (
    <AdminLayout title="Add new post" eyebrow="Posts" staff={staff} notConfigured={notConfigured} counts={counts}>
      {!notConfigured && <PostEditor post={null} categories={categories} authors={authors} defaults={defaults} />}
    </AdminLayout>
  );
}

NewPostPage.getLayout = (page) => page;
