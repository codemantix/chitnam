import { useState } from "react";
import Card from "@/components/admin/Card/Card";
import Modal from "@/components/admin/Modal/Modal";
import Field from "@/components/forms/Field/Field";
import Alert from "@/components/ui/Alert/Alert";
import Button from "@/components/ui/Button/Button";
import Icon from "@/components/ui/Icon/Icon";
import { cn } from "@/utils/cn";
import { formatDate, formatRelative } from "@/utils/date";
import { hasErrors, validateInvite } from "@/utils/validation";
import { useConfirm } from "@/components/admin/ConfirmDialog/ConfirmDialog";
import styles from "./TeamManager.module.css";

const ROLE_OPTIONS = [
  {
    value: "editor",
    label: "Editor",
    description:
      "Writes and publishes posts, manages categories and replies to enquiries.",
  },
  {
    value: "admin",
    label: "Administrator",
    description:
      "Everything editors can do, plus team members and site settings.",
  },
];

const PERMISSIONS = [
  ["Write, edit and publish posts", true, true],
  ["Manage blog categories", true, true],
  ["View and update enquiries", true, true],
  ["Use the AI writing assistant", true, true],
  ["Edit own profile and password", true, true],
  ["Invite, change or remove team members", false, true],
  ["Edit business details and site settings", false, true],
];

const STATUS = {
  active: { label: "Active", className: "statusActive" },
  invited: { label: "Invited", className: "statusInvited" },
  expired: { label: "Invite expired", className: "statusExpired" },
};

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("") || "?";

/** Stable soft colour per person for the avatar. */
const AVATAR_TONES = [
  "toneGreen",
  "toneViolet",
  "toneAmber",
  "toneBlue",
  "toneRose",
];
const toneFor = (id) =>
  AVATAR_TONES[
    [...id].reduce((sum, c) => sum + c.charCodeAt(0), 0) % AVATAR_TONES.length
  ];

async function request(url, method, body) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => null);
  if (!response)
    throw new Error(
      "We couldn't reach the server. Check your connection and try again.",
    );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      data.message || "Something went wrong. Please try again.",
    );
    error.fields = data.errors;
    throw error;
  }
  return data;
}

function InviteLink({ link }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`You've been invited to the Chitnam website admin. Set up your account here (link expires in 24 hours): ${link}`)}`;
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-ink-900" htmlFor="invite-link">
        One-time invite link
      </label>
      <div className="flex gap-2">
        <input
          id="invite-link"
          readOnly
          value={link}
          onFocus={(e) => e.target.select()}
          className={cn(styles.input, styles.mono)}
        />
        <Button type="button" variant="secondary" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-600">
        <span>
          Works once and expires in 24 hours. Share it only with this person.
        </span>
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand-700 hover:underline"
        >
          Send on WhatsApp
        </a>
      </p>
    </div>
  );
}

/**
 * Team members, invitations, roles and access.
 *
 * @param {object} props
 * @param {object[]} props.initialMembers From services/team.js → listTeam.
 * @param {{ id: string, role: string }} props.me
 * @param {number} props.now Server time, for consistent "x days ago" output.
 * @param {boolean} [props.canEmail=true] False on local/dev sites: emails are only sent from the live site.
 */
export default function TeamManager({
  initialMembers,
  me,
  now,
  canEmail = true,
}) {
  const confirm = useConfirm();
  const isAdmin = me.role === "admin";
  const [members, setMembers] = useState(initialMembers);
  const [notice, setNotice] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [linkFor, setLinkFor] = useState(null); // { name, link }

  // Invite dialog
  const blank = {
    fullName: "",
    email: "",
    role: "editor",
    jobTitle: "",
    sendEmail: canEmail,
  };
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState(blank);
  const [inviteErrors, setInviteErrors] = useState({});
  const [inviteState, setInviteState] = useState("idle"); // idle | sending | done
  const [inviteResult, setInviteResult] = useState(null);

  const pending = members.filter((m) => m.status !== "active").length;
  const shown = members.filter(
    (m) =>
      filter === "all" ||
      (filter === "pending" ? m.status !== "active" : m.role === filter),
  );

  const openInvite = () => {
    setInvite(blank);
    setInviteErrors({});
    setInviteResult(null);
    setInviteState("idle");
    setInviteOpen(true);
  };

  const sendInvite = async (event) => {
    event?.preventDefault();
    const { errors: clientErrors } = validateInvite(invite);
    if (hasErrors(clientErrors)) {
      setInviteErrors(clientErrors);
      return;
    }
    setInviteState("sending");
    setInviteErrors({});
    try {
      const result = await request("/api/admin/team/", "POST", invite);
      setMembers((list) => [
        ...list,
        {
          ...result.member,
          invitedBy: null,
          createdAt: new Date().toISOString(),
        },
      ]);
      setInviteResult(result);
      setInviteState("done");
    } catch (error) {
      setInviteErrors(error.fields || { form: error.message });
      setInviteState("idle");
    }
  };

  const act = async (member, fn, success) => {
    setBusyId(member.id);
    setNotice(null);
    try {
      await fn();
      if (success) setNotice({ tone: "success", text: success });
    } catch (error) {
      setNotice({ tone: "error", text: error.message });
    } finally {
      setBusyId(null);
    }
  };

  const changeRole = (member, role) =>
    act(
      member,
      async () => {
        await request(`/api/admin/team/${member.id}/`, "PATCH", { role });
        setMembers((list) =>
          list.map((m) => (m.id === member.id ? { ...m, role } : m)),
        );
      },
      `${member.fullName} is now ${role === "admin" ? "an administrator" : "an editor"}.`,
    );

  const remove = async (member) => {
    const active = member.status === "active";
    const ok = await confirm(
      active
        ? {
            tone: "danger",
            icon: "users",
            title: `Remove ${member.fullName}?`,
            message: `${member.email} will lose access to the admin area straight away.`,
            details: [
              "Their login is deleted and they're signed out everywhere.",
              "Posts they wrote stay on the website.",
              "You can invite them again later.",
            ],
            confirmLabel: "Remove access",
          }
        : {
            tone: "danger",
            icon: "mail",
            title: `Cancel ${member.fullName}'s invitation?`,
            message: `The invite link sent to ${member.email} stops working.`,
            confirmLabel: "Cancel invitation",
            cancelLabel: "Keep invitation",
          },
    );
    if (!ok) return;
    act(
      member,
      async () => {
        await request(`/api/admin/team/${member.id}/`, "DELETE");
        setMembers((list) => list.filter((m) => m.id !== member.id));
      },
      member.status === "active"
        ? `${member.fullName} no longer has access.`
        : `Invitation for ${member.fullName} cancelled.`,
    );
  };

  const newLink = (member) =>
    act(member, async () => {
      const { link } = await request(`/api/admin/team/${member.id}/`, "POST", {
        action: "link",
      });
      setMembers((list) =>
        list.map((m) =>
          m.id === member.id
            ? { ...m, status: "invited", invitedAt: new Date().toISOString() }
            : m,
        ),
      );
      setLinkFor({ name: member.fullName, link });
    });

  const resend = (member) =>
    act(
      member,
      async () => {
        await request(`/api/admin/team/${member.id}/`, "POST", {
          action: "resend",
        });
        setMembers((list) =>
          list.map((m) =>
            m.id === member.id
              ? { ...m, status: "invited", invitedAt: new Date().toISOString() }
              : m,
          ),
        );
      },
      `Invitation email sent again to ${member.email}.`,
    );

  return (
    <div className="flex flex-col gap-6">
      {/* ---------- Summary + actions ---------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Filter team" className={styles.filters}>
          {[
            ["all", `All (${members.length})`],
            ["admin", "Administrators"],
            ["editor", "Editors"],
            ["pending", `Pending (${pending})`],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={filter === value}
              onClick={() => setFilter(value)}
              className={cn(
                styles.filter,
                filter === value && styles.filterActive,
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {isAdmin && (
          <Button type="button" onClick={openInvite} className="self-start">
            Invite member
          </Button>
        )}
      </div>

      {notice && <Alert tone={notice.tone} title={notice.text} />}
      {!isAdmin && (
        <Alert
          tone="info"
          title="Only administrators can invite people or change roles."
        />
      )}

      {/* ---------- Members ---------- */}
      <Card padding="none">
        <div className={styles.tableHead} aria-hidden="true">
          <span>Member</span>
          <span>Role</span>
          <span>Status</span>
          <span>Last active</span>
          <span />
        </div>
        {shown.length === 0 ? (
          <p className="p-6 text-sm text-ink-600">
            Nobody matches this filter.
          </p>
        ) : (
          <ul>
            {shown.map((member) => {
              const isMe = member.id === me.id;
              const busy = busyId === member.id;
              const status = STATUS[member.status];
              return (
                <li
                  key={member.id}
                  className={cn(styles.row, busy && styles.rowBusy)}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(styles.avatar, styles[toneFor(member.id)])}
                      aria-hidden="true"
                    >
                      {initials(member.fullName)}
                    </span>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-semibold text-ink-900">
                        <span className="truncate">{member.fullName}</span>
                        {isMe && <span className={styles.you}>You</span>}
                      </p>
                      <p className="truncate text-sm text-ink-600">
                        {member.email}
                        {member.jobTitle && <> · {member.jobTitle}</>}
                      </p>
                    </div>
                  </div>

                  <div className={styles.cell}>
                    <span className={styles.cellLabel}>Role</span>
                    {isAdmin ? (
                      <>
                        <label
                          className="sr-only"
                          htmlFor={`role-${member.id}`}
                        >
                          Role for {member.fullName}
                        </label>
                        <select
                          id={`role-${member.id}`}
                          value={member.role}
                          disabled={busy}
                          onChange={(e) => changeRole(member, e.target.value)}
                          className={cn(
                            styles.roleSelect,
                            member.role === "admin" && styles.roleAdmin,
                          )}
                        >
                          <option value="editor">Editor</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </>
                    ) : (
                      <span
                        className={cn(
                          styles.roleBadge,
                          member.role === "admin" && styles.roleAdmin,
                        )}
                      >
                        {member.role === "admin" ? "Administrator" : "Editor"}
                      </span>
                    )}
                  </div>

                  <div className={styles.cell}>
                    <span className={styles.cellLabel}>Status</span>
                    <span
                      className={cn(styles.status, styles[status.className])}
                    >
                      <span className={styles.dot} aria-hidden="true" />
                      {status.label}
                    </span>
                  </div>

                  <div className={cn(styles.cell, "text-sm text-ink-600")}>
                    <span className={styles.cellLabel}>Last active</span>
                    {member.lastSignInAt ? (
                      <time
                        dateTime={member.lastSignInAt}
                        title={formatDate(member.lastSignInAt)}
                      >
                        {formatRelative(member.lastSignInAt, now)}
                      </time>
                    ) : member.invitedAt ? (
                      <span title={formatDate(member.invitedAt)}>
                        Invited {formatRelative(member.invitedAt, now)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </div>

                  <div className={styles.actions}>
                    {isAdmin && member.status !== "active" && (
                      <>
                        <button
                          type="button"
                          className={styles.action}
                          onClick={() => newLink(member)}
                          disabled={busy}
                          title="Get a new one-time invite link"
                        >
                          <Icon name="link" size={16} />
                          <span className="whitespace-nowrap">Copy link</span>
                        </button>
                        {canEmail && (
                          <button
                            type="button"
                            className={styles.action}
                            onClick={() => resend(member)}
                            disabled={busy}
                            title="Send the invitation email again"
                          >
                            <Icon name="mail" size={16} />
                            <span className="whitespace-nowrap">Resend</span>
                          </button>
                        )}
                      </>
                    )}
                    {isAdmin && !isMe && (
                      <button
                        type="button"
                        className={cn(styles.action, styles.danger)}
                        onClick={() => remove(member)}
                        disabled={busy}
                        title={
                          member.status === "active"
                            ? "Remove access"
                            : "Cancel invitation"
                        }
                      >
                        <Icon name="trash" size={16} />
                        <span className="sr-only">
                          {member.status === "active"
                            ? `Remove ${member.fullName}`
                            : `Cancel invitation for ${member.fullName}`}
                        </span>
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* ---------- Roles explained ---------- */}
      <Card
        title="What each role can do"
        description="Give people the least access they need. You can change a role at any time."
      >
        <div className="overflow-x-auto">
          <table className={styles.matrix}>
            <thead>
              <tr>
                <th scope="col">Permission</th>
                <th scope="col">Editor</th>
                <th scope="col">Administrator</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map(([label, editor, admin]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {[editor, admin].map((allowed, i) => (
                    <td key={i}>
                      {allowed ? (
                        <span className={styles.yes}>
                          <Icon name="check" size={16} />
                          <span className="sr-only">Yes</span>
                        </span>
                      ) : (
                        <span className={styles.no}>
                          —<span className="sr-only">No</span>
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ---------- Invite dialog ---------- */}
      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title={
          inviteState === "done" ? "Invitation ready" : "Invite a team member"
        }
        size="md"
        footer={
          inviteState === "done" ? (
            <>
              <Button type="button" variant="ghost" onClick={openInvite}>
                Invite someone else
              </Button>
              <Button type="button" onClick={() => setInviteOpen(false)}>
                Done
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setInviteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={sendInvite}
                loading={inviteState === "sending"}
                disabled={inviteState === "sending"}
              >
                {invite.sendEmail ? "Send invitation" : "Create invite link"}
              </Button>
            </>
          )
        }
      >
        {inviteState === "done" && inviteResult ? (
          <div className="flex flex-col gap-4">
            {inviteResult.emailSent ? (
              <Alert
                tone="success"
                title={`Invitation emailed to ${inviteResult.member.email}`}
              >
                They&rsquo;ll get a link to set their password. It expires in 24
                hours; you can resend it or copy a new link from the team list.
              </Alert>
            ) : inviteResult.emailError ? (
              <Alert tone="warning" title={inviteResult.emailError}>
                Share the link below with {inviteResult.member.fullName}{" "}
                instead.
              </Alert>
            ) : (
              <Alert
                tone="success"
                title={`Invite link created for ${inviteResult.member.fullName}`}
              />
            )}
            {inviteResult.link && <InviteLink link={inviteResult.link} />}
          </div>
        ) : (
          <form
            method="post"
            onSubmit={sendInvite}
            className="flex flex-col gap-4"
            noValidate
          >
            {inviteErrors.form && (
              <Alert tone="error" title={inviteErrors.form} />
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="inv-name"
                name="fullName"
                label="Full name"
                required
                value={invite.fullName}
                onChange={(e) =>
                  setInvite((v) => ({ ...v, fullName: e.target.value }))
                }
                error={inviteErrors.fullName}
                maxLength={120}
                data-autofocus
                autoComplete="off"
              />
              <Field
                id="inv-email"
                name="email"
                type="email"
                label="Email address"
                required
                value={invite.email}
                onChange={(e) =>
                  setInvite((v) => ({ ...v, email: e.target.value }))
                }
                error={inviteErrors.email}
                maxLength={254}
                autoComplete="off"
              />
            </div>
            <Field
              id="inv-title"
              name="jobTitle"
              label="Job title"
              hint="e.g. Admissions adviser"
              value={invite.jobTitle}
              onChange={(e) =>
                setInvite((v) => ({ ...v, jobTitle: e.target.value }))
              }
              error={inviteErrors.jobTitle}
              maxLength={80}
            />
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-medium text-ink-900">
                Role
              </legend>
              {ROLE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    styles.roleCard,
                    invite.role === option.value && styles.roleCardActive,
                  )}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={invite.role === option.value}
                    onChange={() =>
                      setInvite((v) => ({ ...v, role: option.value }))
                    }
                    className="mt-1 size-4 accent-brand-700"
                  />
                  <span className="flex flex-col">
                    <span className="font-semibold text-ink-900">
                      {option.label}
                    </span>
                    <span className="text-sm text-ink-600">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
              {inviteErrors.role && (
                <p className="text-sm text-error-700">{inviteErrors.role}</p>
              )}
            </fieldset>
            <label className={styles.toggleRow}>
              <input
                type="checkbox"
                checked={invite.sendEmail}
                disabled={!canEmail}
                onChange={(e) =>
                  setInvite((v) => ({ ...v, sendEmail: e.target.checked }))
                }
                className="size-4 accent-brand-700"
              />
              <span className="flex flex-col">
                <span className="font-medium text-ink-900">
                  Send the invitation by email
                </span>
                <span className="text-sm text-ink-600">
                  {canEmail
                    ? "Untick to get a one-time link to share yourself instead (e.g. on WhatsApp)."
                    : "Emails are only sent from the live website, so their links never point to a local address. Here you'll get a one-time link to share instead."}
                </span>
              </span>
            </label>
          </form>
        )}
      </Modal>

      {/* ---------- New link dialog ---------- */}
      <Modal
        open={Boolean(linkFor)}
        onClose={() => setLinkFor(null)}
        title={`New invite link for ${linkFor?.name || ""}`}
        size="md"
        footer={
          <Button type="button" onClick={() => setLinkFor(null)}>
            Done
          </Button>
        }
      >
        {linkFor && (
          <div className="flex flex-col gap-4">
            <Alert
              tone="info"
              title="Any earlier invite link for this person no longer works."
            />
            <InviteLink link={linkFor.link} />
          </div>
        )}
      </Modal>
    </div>
  );
}
