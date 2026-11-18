import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout/AdminLayout";
import Card from "@/components/admin/Card/Card";
import Icon from "@/components/ui/Icon/Icon";
import StatCard from "@/components/admin/StatCard/StatCard";
import Alert from "@/components/ui/Alert/Alert";
import Button from "@/components/ui/Button/Button";
import { INTEREST_OPTIONS, labelFor } from "@/constants/enquiry";
import { withStaff } from "@/services/auth";
import { countEnquiriesByStatus, listEnquiries } from "@/services/enquiries";
import { countPostsByStatus, listAllPosts } from "@/services/posts";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/date";

/** Greeting in Nigerian time, computed on the server so it never flickers. */
function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Africa/Lagos" }).format(new Date()));
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

export const getServerSideProps = withStaff(async (ctx, { supabase }) => {
  try {
    const [enquiries, posts, recentEnquiries, allPosts] = await Promise.all([
      countEnquiriesByStatus(supabase),
      countPostsByStatus(supabase),
      listEnquiries(supabase, { limit: 5 }),
      listAllPosts(supabase),
    ]);
    return {
      props: { enquiries, posts, recentEnquiries, recentPosts: allPosts.slice(0, 5), greeting: greeting(), loadError: false },
    };
  } catch (error) {
    console.error("[admin] dashboard:", error.message);
    return { props: { loadError: true, greeting: greeting() } };
  }
});

export default function AdminDashboard({ staff, notConfigured, counts, enquiries, posts, recentEnquiries, recentPosts, greeting: hello, loadError }) {
  const firstName = staff?.name?.split(" ")[0];

  return (
    <AdminLayout
      title={firstName ? `${hello}, ${firstName}` : "Dashboard"}
      eyebrow="Dashboard"
      staff={staff}
      notConfigured={notConfigured}
      counts={counts}
      actions={
        <Button href="/admin/posts/new/" withArrow>
          Write a new post
        </Button>
      }
    >
      {loadError ? (
        <Alert tone="error" title="The dashboard couldn't load. Refresh the page to try again." />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="New enquiries" value={enquiries.new} href="/admin/enquiries/?status=new" icon="inbox" tone="green" hint="Waiting for a reply" />
            <StatCard label="In progress" value={enquiries.contacted} href="/admin/enquiries/?status=contacted" icon="phone" tone="amber" hint="Contacted" />
            <StatCard label="Published posts" value={posts.published} href="/admin/posts/?status=published" icon="globe" tone="blue" />
            <StatCard label="Drafts" value={posts.draft} href="/admin/posts/?status=draft" icon="posts" tone="slate" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <Card
              title="Latest enquiries"
              description="The five most recent messages from the website."
              actions={
                <Link href="/admin/enquiries/" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 no-underline hover:underline">
                  View all <Icon name="arrowRight" size={16} />
                </Link>
              }
              padding="none"
            >
              {recentEnquiries.length === 0 ? (
                <p className="p-5 text-sm text-ink-600">No enquiries yet. They’ll appear here as soon as someone uses the Apply or Contact form.</p>
              ) : (
                <ul className="flex flex-col p-2">
                  {recentEnquiries.map((enquiry) => (
                    <li key={enquiry.id}>
                      <Link href={`/admin/enquiries/?open=${enquiry.id}`} className="flex items-center gap-4 rounded-2xl p-3 no-underline transition-colors hover:bg-[#f6f7f4]">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 font-display text-sm font-semibold text-brand-800">
                          {enquiry.full_name.trim()[0]?.toUpperCase()}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate font-medium text-ink-900">{enquiry.full_name}</span>
                          <span className="truncate text-sm text-ink-600">
                            {enquiry.interest ? labelFor(INTEREST_OPTIONS, enquiry.interest) : enquiry.source === "apply" ? "Study abroad enquiry" : "Contact message"}
                          </span>
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-1">
                          <span className="text-xs text-ink-600">{formatDate(enquiry.created_at)}</span>
                          {enquiry.status === "new" && <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[0.6875rem] font-semibold text-white">New</span>}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card
              title="Recent posts"
              actions={
                <Link href="/admin/posts/" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 no-underline hover:underline">
                  All posts <Icon name="arrowRight" size={16} />
                </Link>
              }
              padding="none"
            >
              {recentPosts.length === 0 ? (
                <div className="flex flex-col items-start gap-3 p-5">
                  <p className="text-sm text-ink-600">No posts yet. Articles help students find you on Google.</p>
                  <Button href="/admin/posts/new/" variant="secondary">
                    Write your first post
                  </Button>
                </div>
              ) : (
                <ul className="flex flex-col p-2">
                  {recentPosts.map((post) => (
                    <li key={post.id}>
                      <Link href={`/admin/posts/${post.id}/`} className="flex items-center justify-between gap-3 rounded-2xl p-3 no-underline transition-colors hover:bg-[#f6f7f4]">
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate font-medium text-ink-900">{post.title}</span>
                          <span className="text-xs text-ink-600">Edited {formatDate(post.updated_at)}</span>
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            post.status === "published" ? "bg-brand-50 text-brand-800" : "bg-[#fff5e0] text-[#9a6400]"
                          )}
                        >
                          {post.status === "published" ? "Published" : "Draft"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

AdminDashboard.getLayout = (page) => page;
