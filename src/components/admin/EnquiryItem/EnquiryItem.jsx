import { useState } from "react";
import Icon from "@/components/ui/Icon/Icon";
import Field from "@/components/forms/Field/Field";
import Button from "@/components/ui/Button/Button";
import {
  DESTINATION_OPTIONS,
  ENQUIRY_STATUS_OPTIONS,
  INTEREST_OPTIONS,
  STUDY_LEVEL_OPTIONS,
  labelFor,
} from "@/constants/enquiry";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/date";
import styles from "./EnquiryItem.module.css";

const timeFormatter = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });

/**
 * One enquiry: a summary row that expands to the full details, with status
 * and private staff notes that save through the admin API.
 *
 * @param {object} props
 * @param {object} props.enquiry Row from the enquiries table.
 * @param {boolean} [props.defaultOpen]
 */
export default function EnquiryItem({ enquiry, defaultOpen = false }) {
  const [status, setStatus] = useState(enquiry.status);
  const [savedStatus, setSavedStatus] = useState(enquiry.status);
  const [notes, setNotes] = useState(enquiry.staff_notes || "");
  const [state, setState] = useState("idle"); // idle | saving | saved | error

  const save = async () => {
    setState("saving");
    const response = await fetch(`/api/admin/enquiries/${enquiry.id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, staffNotes: notes }),
    }).catch(() => null);
    if (response?.ok) {
      setSavedStatus(status);
      setState("saved");
    } else {
      setState("error");
    }
  };

  const phoneHref = enquiry.phone ? `tel:${enquiry.phone.replace(/[^\d+]/g, "")}` : null;
  const details = [
    ["Form", enquiry.source === "apply" ? "Apply now" : "Contact"],
    ["Destination", labelFor(DESTINATION_OPTIONS, enquiry.destination)],
    ["Study level", labelFor(STUDY_LEVEL_OPTIONS, enquiry.study_level)],
    ["Course / field", enquiry.field_of_interest || "—"],
    ["Help needed", labelFor(INTEREST_OPTIONS, enquiry.interest)],
  ];

  return (
    <details className={styles.item} open={defaultOpen}>
      <summary className={cn(styles.summary, "flex items-center gap-4 p-3 pr-4")}>
        <span className={styles.avatar} aria-hidden="true">
          {enquiry.full_name.trim()[0]?.toUpperCase()}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-semibold text-ink-900">{enquiry.full_name}</span>
          <span className="truncate text-sm text-ink-600">
            {enquiry.email} · {enquiry.source === "apply" ? "Apply" : "Contact"}
          </span>
        </span>
        <span className="hidden text-right text-sm text-ink-600 sm:block">
          {formatDate(enquiry.created_at)}
          <span className="block text-xs">{timeFormatter.format(new Date(enquiry.created_at))}</span>
        </span>
        <span className={cn(styles.status, styles[`status_${savedStatus}`])}>{labelFor(ENQUIRY_STATUS_OPTIONS, savedStatus)}</span>
        <span className={styles.chevron} aria-hidden="true">
          <Icon name="arrowRight" size={18} />
        </span>
      </summary>

      <div className="grid gap-6 px-3 pt-2 pb-4 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            <a href={`mailto:${enquiry.email}`} className={styles.action}>
              <Icon name="mail" size={16} /> Email
            </a>
            {phoneHref && (
              <a href={phoneHref} className={styles.action}>
                <Icon name="phone" size={16} /> {enquiry.phone}
              </a>
            )}
          </div>
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div key={label} className={styles.fact}>
                <dt className="text-xs font-medium text-ink-600">{label}</dt>
                <dd className="font-medium text-ink-900">{value}</dd>
              </div>
            ))}
          </dl>
          {enquiry.message && (
            <div className={styles.message}>
              <p className="mb-2 text-xs font-medium text-ink-600">Message</p>
              <p className="whitespace-pre-line text-ink-900">{enquiry.message}</p>
            </div>
          )}
        </div>

        <div className={cn(styles.panel, "flex flex-col gap-4 p-4")}>
          <Field
            as="select"
            id={`status-${enquiry.id}`}
            label="Status"
            required
            placeholderOption="Choose a status"
            options={ENQUIRY_STATUS_OPTIONS}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setState("idle");
            }}
          />
          <Field
            as="textarea"
            id={`notes-${enquiry.id}`}
            label="Staff notes"
            hint="Private. Never shown to the student."
            rows={4}
            maxLength={2000}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setState("idle");
            }}
          />
          <div className="flex items-center gap-3">
            <Button onClick={save} loading={state === "saving"}>
              {state === "saving" ? "Saving…" : "Save changes"}
            </Button>
            <p role="status" className={cn("text-sm", state === "error" ? "text-error-700" : "text-brand-700")}>
              {state === "saved" && "Saved"}
              {state === "error" && "Couldn't save. Try again."}
            </p>
          </div>
        </div>
      </div>
    </details>
  );
}
