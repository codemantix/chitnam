import { useState } from "react";
import Card from "@/components/admin/Card/Card";
import Alert from "@/components/ui/Alert/Alert";
import Button from "@/components/ui/Button/Button";
import Icon from "@/components/ui/Icon/Icon";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";
import { useConfirm } from "@/components/admin/ConfirmDialog/ConfirmDialog";
import styles from "./CategoryManager.module.css";

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
  if (!response.ok)
    throw new Error(data.message || "Something went wrong. Please try again.");
  return data;
}

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * Add, rename, reorder and delete blog categories.
 *
 * @param {object} props
 * @param {{ id: string, slug: string, name: string, description: string|null, postCount: number }[]} props.initialCategories
 */
export default function CategoryManager({ initialCategories }) {
  const confirm = useConfirm();
  const [categories, setCategories] = useState(initialCategories);
  const [notice, setNotice] = useState(null); // { tone, text }
  const [busyId, setBusyId] = useState(null);

  // Add form
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [adding, setAdding] = useState(false);

  // Inline edit
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: "", description: "" });

  const say = (tone, text) => setNotice({ tone, text });

  const add = async (event) => {
    event.preventDefault();
    if (newName.trim().length < 2)
      return say("error", "Enter a category name (at least 2 characters).");
    setAdding(true);
    try {
      const { category } = await request("/api/admin/categories/", "POST", {
        name: newName,
        description: newDescription,
      });
      setCategories((list) => [...list, { ...category, postCount: 0 }]);
      setNewName("");
      setNewDescription("");
      say("success", `“${category.name}” added.`);
    } catch (error) {
      say("error", error.message);
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setDraft({ name: category.name, description: category.description || "" });
    setNotice(null);
  };

  const saveEdit = async (category) => {
    if (draft.name.trim().length < 2)
      return say("error", "Enter a category name (at least 2 characters).");
    setBusyId(category.id);
    try {
      const { category: saved } = await request(
        `/api/admin/categories/${category.id}/`,
        "PATCH",
        draft,
      );
      setCategories((list) =>
        list.map((c) => (c.id === category.id ? { ...c, ...saved } : c)),
      );
      setEditingId(null);
      say("success", `“${saved.name}” saved.`);
    } catch (error) {
      say("error", error.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (category) => {
    const ok = await confirm({
      tone: "danger",
      title: `Delete “${category.name}”?`,
      message: "The category is removed from the blog filters straight away. This can't be undone.",
      details:
        category.postCount > 0
          ? [`${plural(category.postCount, "post")} will become “Uncategorised”.`, "The posts themselves stay published."]
          : undefined,
      confirmLabel: "Delete category",
    });
    if (!ok) return;
    setBusyId(category.id);
    try {
      await request(`/api/admin/categories/${category.id}/`, "DELETE");
      setCategories((list) => list.filter((c) => c.id !== category.id));
      say("success", `“${category.name}” deleted.`);
    } catch (error) {
      say("error", error.message);
    } finally {
      setBusyId(null);
    }
  };

  const move = async (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= categories.length) return;
    const previous = categories;
    const next = [...categories];
    [next[index], next[target]] = [next[target], next[index]];
    setCategories(next); // optimistic
    setBusyId(next[target].id);
    try {
      await request("/api/admin/categories/", "PUT", {
        ids: next.map((c) => c.id),
      });
      setNotice(null);
    } catch (error) {
      setCategories(previous);
      say("error", error.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
      <Card
        title="All categories"
        description="The order here is the order of the filters on the blog page. Only categories with published posts appear there."
        padding="none"
      >
        {notice && (
          <div className="px-5 pt-4">
            <Alert tone={notice.tone} title={notice.text} />
          </div>
        )}
        {categories.length === 0 ? (
          <p className="p-5 text-sm text-ink-600">
            No categories yet. Add the first one.
          </p>
        ) : (
          <ol className={styles.list}>
            {categories.map((category, index) => {
              const editing = editingId === category.id;
              const busy = busyId === category.id;
              return (
                <li
                  key={category.id}
                  className={cn(styles.row, editing && styles.rowEditing)}
                >
                  <div className={styles.order}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => move(index, -1)}
                      disabled={index === 0 || Boolean(busyId)}
                      title="Move up"
                    >
                      <Icon
                        name="chevronRight"
                        size={16}
                        className="-rotate-90"
                      />
                      <span className="sr-only">Move {category.name} up</span>
                    </button>
                    <span className={styles.position} aria-hidden="true">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => move(index, 1)}
                      disabled={
                        index === categories.length - 1 || Boolean(busyId)
                      }
                      title="Move down"
                    >
                      <Icon
                        name="chevronRight"
                        size={16}
                        className="rotate-90"
                      />
                      <span className="sr-only">Move {category.name} down</span>
                    </button>
                  </div>

                  {editing ? (
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <label
                        className="sr-only"
                        htmlFor={`name-${category.id}`}
                      >
                        Name
                      </label>
                      <input
                        id={`name-${category.id}`}
                        autoFocus
                        value={draft.name}
                        maxLength={60}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, name: e.target.value }))
                        }
                        onKeyDown={(e) =>
                          e.key === "Escape" && setEditingId(null)
                        }
                        className={styles.input}
                      />
                      <label
                        className="sr-only"
                        htmlFor={`desc-${category.id}`}
                      >
                        Description
                      </label>
                      <textarea
                        id={`desc-${category.id}`}
                        rows={2}
                        value={draft.description}
                        maxLength={300}
                        placeholder="Description (optional)"
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            description: e.target.value,
                          }))
                        }
                        className={styles.input}
                      />
                      <p className="text-xs text-ink-600">
                        The web address stays{" "}
                        <code>?category={category.slug}</code> so existing links
                        keep working.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => saveEdit(category)}
                          loading={busy}
                          disabled={busy}
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                          disabled={busy}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className={cn(
                          styles.info,
                          "flex min-w-0 flex-1 flex-col gap-0.5",
                        )}
                      >
                        <p className="flex flex-wrap items-baseline gap-x-2">
                          <span className="font-semibold text-ink-900">
                            {category.name}
                          </span>
                          <span className={styles.slug}>/{category.slug}</span>
                        </p>
                        {category.description && (
                          <p className="text-sm text-ink-600">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <div
                        className={cn(
                          styles.meta,
                          "flex shrink-0 items-center gap-3",
                        )}
                      >
                        <span
                          className={cn(
                            styles.count,
                            category.postCount === 0 && styles.countEmpty,
                          )}
                        >
                          {plural(category.postCount, "post")}
                        </span>
                        <div className="flex shrink-0 gap-1">
                          {category.postCount > 0 && (
                            <a
                              href={`${ROUTES.blog}?category=${category.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.iconBtn}
                              title="View on the blog"
                            >
                              <Icon name="external" size={16} />
                              <span className="sr-only">
                                View {category.name} on the blog (opens in a new
                                tab)
                              </span>
                            </a>
                          )}
                          <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={() => startEdit(category)}
                            disabled={Boolean(busyId)}
                            title="Rename"
                          >
                            <Icon name="posts" size={16} />
                            <span className="sr-only">
                              Rename {category.name}
                            </span>
                          </button>
                          <button
                            type="button"
                            className={cn(styles.iconBtn, styles.danger)}
                            onClick={() => remove(category)}
                            disabled={Boolean(busyId)}
                            title="Delete"
                          >
                            <Icon name="trash" size={16} />
                            <span className="sr-only">
                              Delete {category.name}
                            </span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </Card>

      <Card
        title="Add a category"
        description="Short, clear names work best, e.g. “Scholarships” or “Studying in Canada”."
      >
        <form method="post" onSubmit={add} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="new-cat-name"
              className="text-sm font-medium text-ink-900"
            >
              Name
            </label>
            <input
              id="new-cat-name"
              value={newName}
              maxLength={60}
              onChange={(e) => setNewName(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="new-cat-desc"
              className="text-sm font-medium text-ink-900"
            >
              Description{" "}
              <span className="font-normal text-ink-600">(optional)</span>
            </label>
            <textarea
              id="new-cat-desc"
              rows={3}
              value={newDescription}
              maxLength={300}
              onChange={(e) => setNewDescription(e.target.value)}
              className={styles.input}
            />
          </div>
          <Button
            type="submit"
            loading={adding}
            disabled={adding}
            className="self-start"
          >
            Add category
          </Button>
        </form>
      </Card>
    </div>
  );
}
