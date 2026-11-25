import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Icon from "@/components/ui/Icon/Icon";
import Modal from "@/components/admin/Modal/Modal";
import Field from "@/components/forms/Field/Field";
import Alert from "@/components/ui/Alert/Alert";
import Button from "@/components/ui/Button/Button";
import { blogImageUrl } from "@/lib/supabase/config";
import { listBlogImages, uploadBlogImage } from "@/lib/uploadImage";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/date";
import styles from "./MediaModal.module.css";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

function MediaBrowser({ mode, uploadName, initialAlt, onSelect }) {
  const [tab, setTab] = useState("library");
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState(null);
  const [alt, setAlt] = useState(initialAlt);
  const [altError, setAltError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    listBlogImages()
      .then((files) => {
        if (cancelled) return;
        setItems(files);
        setStatus("ready");
        if (files.length === 0) setTab("upload");
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(error.message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const select = (item) => {
    setSelected(item);
    setAltError("");
  };

  const upload = async (files) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const path = await uploadBlogImage(file, { folder: mode === "featured" ? "covers" : "content", name: uploadName || file.name });
      const item = { path, name: path.split("/").pop(), createdAt: new Date().toISOString(), size: file.size };
      setItems((current) => [item, ...current]);
      setStatus("ready");
      select(item);
      setTab("library");
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const confirm = () => {
    if (!alt.trim()) {
      setAltError("Describe the image for people who can't see it (this also helps search engines).");
      return;
    }
    onSelect({ path: selected.path, url: blogImageUrl(selected.path), alt: alt.trim() });
  };

  return (
    <div className="grid h-full gap-6 lg:grid-cols-[1fr_19rem]">
      {/* ----- Left: tabs + content ----- */}
      <div className="flex min-h-0 flex-col gap-5">
        <div role="tablist" aria-label="Media" className={styles.tabs}>
          {[
            ["upload", "Upload files"],
            ["library", `Media library${items.length ? ` (${items.length})` : ""}`],
          ].map(([value, label]) => (
            <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={cn(styles.tab, tab === value && styles.tabActive)}>
              {label}
            </button>
          ))}
        </div>

        {tab === "upload" ? (
          <div
            className={cn(styles.dropzone, dragging && styles.dragging, "flex flex-col items-center justify-center gap-4 p-8 text-center")}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              upload(event.dataTransfer.files);
            }}
          >
            <span className={styles.dropIcon} aria-hidden="true">
              <Icon name="upload" size={26} />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-lg font-semibold">{uploading ? "Uploading…" : "Drop an image here"}</p>
              <p className="text-sm text-ink-600">or</p>
            </div>
            <Button type="button" variant="secondary" loading={uploading} onClick={() => fileRef.current?.click()}>
              Select file
            </Button>
            <input ref={fileRef} type="file" accept={ACCEPT} className="sr-only" tabIndex={-1} onChange={(event) => upload(event.target.files)} />
            <p className="text-xs text-ink-600">JPG, PNG, WebP or AVIF · up to 25 MB · large images are resized and compressed for you · landscape images at least 1600 px wide look best</p>
            {uploadError && <Alert tone="error" title={uploadError} className="w-full text-left" />}
          </div>
        ) : status === "loading" ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4" aria-busy="true" aria-label="Loading media">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : status === "error" ? (
          <Alert tone="error" title="The media library couldn't load.">
            {loadError} You can still upload a new image.
          </Alert>
        ) : items.length === 0 ? (
          <div className={cn(styles.empty, "flex flex-col items-center gap-3 p-10 text-center")}>
            <Icon name="image" size={28} />
            <p className="font-medium">No images yet</p>
            <Button type="button" variant="secondary" onClick={() => setTab("upload")}>
              Upload your first image
            </Button>
          </div>
        ) : (
          <ul className={cn(styles.grid, "grid grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4")} aria-label="Images">
            {items.map((item) => {
              const isSelected = selected?.path === item.path;
              return (
                <li key={item.path}>
                  <button type="button" onClick={() => select(item)} aria-pressed={isSelected} className={cn(styles.thumb, isSelected && styles.thumbSelected)}>
                    <Image src={blogImageUrl(item.path)} alt="" fill sizes="160px" className="object-cover" />
                    <span className="sr-only">{item.name}</span>
                    {isSelected && (
                      <span className={styles.check} aria-hidden="true">
                        <Icon name="check" size={14} strokeWidth={2.5} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ----- Right: attachment details ----- */}
      <aside className={cn(styles.details, "flex flex-col gap-4 p-5")} aria-label="Attachment details">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-600">Attachment details</p>
        {selected ? (
          <>
            <div className={styles.preview}>
              <Image src={blogImageUrl(selected.path)} alt="" fill sizes="300px" className="object-cover" />
            </div>
            <div className="text-xs text-ink-600">
              <p className="truncate font-medium text-ink-900" title={selected.name}>
                {selected.name}
              </p>
              <p>
                {formatDate(selected.createdAt)}
                {selected.size ? ` · ${Math.round(selected.size / 1024)} KB` : ""}
              </p>
            </div>
            <Field
              id="media-alt"
              label="Alt text"
              required
              hint="What does the image show? e.g. “Student reviewing an offer letter”."
              value={alt}
              onChange={(event) => {
                setAlt(event.target.value);
                setAltError("");
              }}
              error={altError}
            />
            <Button type="button" onClick={confirm} className="mt-auto w-full">
              {mode === "featured" ? "Set featured image" : "Insert into post"}
            </Button>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm text-ink-600">
            <Icon name="image" size={28} />
            Select an image, or upload a new one.
          </div>
        )}
      </aside>
    </div>
  );
}

/**
 * Media library modal (upload or reuse images), modelled on WordPress.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {"insert"|"featured"} props.mode
 * @param {string} [props.uploadName] Base name for uploaded files.
 * @param {string} [props.initialAlt]
 * @param {(image: { path: string, url: string, alt: string }) => void} props.onSelect
 */
export default function MediaModal({ open, onClose, mode = "insert", uploadName, initialAlt = "", onSelect }) {
  return (
    <Modal open={open} onClose={onClose} title={mode === "featured" ? "Featured image" : "Add media"} size="xl">
      <MediaBrowser mode={mode} uploadName={uploadName} initialAlt={initialAlt} onSelect={onSelect} />
    </Modal>
  );
}
