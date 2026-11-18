import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout/AdminLayout";
import Card from "@/components/admin/Card/Card";
import EnquiryItem from "@/components/admin/EnquiryItem/EnquiryItem";
import Icon from "@/components/ui/Icon/Icon";
import Alert from "@/components/ui/Alert/Alert";
import { ENQUIRY_STATUS_OPTIONS } from "@/constants/enquiry";
import { withStaff } from "@/services/auth";
import { countEnquiriesByStatus, listEnquiries } from "@/services/enquiries";
import { cn } from "@/utils/cn";
import styles from "@/styles/pages/AdminList.module.css";

const FILTERS = [{ value: "", label: "All" }, ...ENQUIRY_STATUS_OPTIONS];

export const getServerSideProps = withStaff(async ({ query }, { supabase }) => {
  const status = ENQUIRY_STATUS_OPTIONS.some((o) => o.value === query.status) ? query.status : "";
  const openId = typeof query.open === "string" ? query.open : null;
  try {
    // Runs as the signed-in staff member: RLS returns enquiries only to staff.
    const [enquiries, totals] = await Promise.all([
      listEnquiries(supabase, { status: status || undefined }),
      countEnquiriesByStatus(supabase),
    ]);
    return { props: { enquiries, totals, status, openId, loadError: false } };
  } catch (error) {
    console.error("[admin] enquiries:", error.message);
    return { props: { enquiries: [], totals: null, status, openId, loadError: true } };
  }
});

export default function AdminEnquiriesPage({ staff, notConfigured, counts, enquiries = [], totals, status, openId, loadError }) {
  const totalFor = (value) =>
    totals ? (value ? totals[value] : Object.values(totals).reduce((sum, n) => sum + n, 0)) : null;

  return (
    <AdminLayout title="Enquiries" eyebrow="Inbox" staff={staff} notConfigured={notConfigured} counts={counts}>
      {loadError && <Alert tone="error" title="Enquiries couldn't be loaded. Refresh the page to try again." />}

      <Card padding="none">
        <div className={cn(styles.toolbar, "flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between")}>
          <nav aria-label="Filter enquiries by status" className={styles.segmented}>
            {FILTERS.map((filter) => {
              const active = filter.value === status;
              const total = totalFor(filter.value);
              return (
                <Link
                  key={filter.value || "all"}
                  href={filter.value ? `/admin/enquiries/?status=${filter.value}` : "/admin/enquiries/"}
                  aria-current={active ? "page" : undefined}
                  className={cn(styles.segment, active && styles.segmentActive)}
                >
                  {filter.label}
                  {total !== null && <span className={styles.segmentCount}>{total}</span>}
                </Link>
              );
            })}
          </nav>
          <p className="text-sm text-ink-600">Newest first · select an enquiry to see details</p>
        </div>

        {enquiries.length === 0 && !loadError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className={styles.emptyIcon} aria-hidden="true">
              <Icon name="inbox" size={28} />
            </span>
            <p className="text-lg font-semibold">{status ? "Nothing here" : "No enquiries yet"}</p>
            <p className="max-w-sm text-sm text-ink-600">
              {status ? "No enquiries have this status." : "New enquiries from the Apply and Contact forms will appear here."}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1 p-2">
            {enquiries.map((enquiry) => (
              <li key={enquiry.id}>
                <EnquiryItem enquiry={enquiry} defaultOpen={enquiry.id === openId} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </AdminLayout>
  );
}

AdminEnquiriesPage.getLayout = (page) => page;
