import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Placeholder } from "@tiptap/extensions";
import Icon from "@/components/ui/Icon/Icon";
import LinkDialog from "@/components/admin/LinkDialog/LinkDialog";
import MediaModal from "@/components/admin/MediaModal/MediaModal";
import proseStyles from "@/components/ui/Prose/Prose.module.css";
import { cn } from "@/utils/cn";
import { readingMinutes, wordCount } from "@/utils/html";
import styles from "./ClassicEditor.module.css";

const FORMATS = [
  { value: "paragraph", label: "Paragraph" },
  { value: "h2", label: "Heading 2" },
  { value: "h3", label: "Heading 3" },
  { value: "h4", label: "Heading 4" },
  { value: "pre", label: "Preformatted" },
];

function ToolButton({ icon, label, shortcut, active, disabled, onClick }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()} // keep the editor selection
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active === undefined ? undefined : active}
      title={shortcut ? `${label} (${shortcut})` : label}
      className={cn(styles.tool, active && styles.toolActive)}
    >
      <Icon name={icon} size={18} />
      <span className="sr-only">{label}</span>
    </button>
  );
}

const Divider = () => <span className={styles.divider} aria-hidden="true" />;

/**
 * Rich-text editor modelled on the WordPress Classic editor.
 *
 * - "Visual" is a what-you-see-is-what-you-get editor (Tiptap/ProseMirror).
 * - "Text" shows and edits the raw HTML.
 * - "Add Media" opens the media library to upload or reuse images.
 * - Output is HTML; the server sanitises it before saving and rendering.
 *
 * Load with next/dynamic and { ssr: false }: it runs in the browser only.
 *
 * @param {object} props
 * @param {string} props.value HTML
 * @param {(html: string) => void} props.onChange
 * @param {string} [props.error]
 * @param {string} [props.uploadName] Used to name uploaded images (e.g. the post slug).
 */
export default function ClassicEditor({ value, onChange, error, uploadName }) {
  const [mode, setMode] = useState("visual");
  const [html, setHtml] = useState(value || "");
  const [showKitchenSink, setShowKitchenSink] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const textRef = useRef(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          // Target/rel are chosen per link in the link dialog.
          HTMLAttributes: { target: null, rel: null },
        },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start writing your article…" }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: cn(proseStyles.prose, styles.content),
        "aria-label": "Article content",
        role: "textbox",
        "aria-multiline": "true",
      },
    },
    onUpdate: ({ editor: instance }) => {
      const next = instance.isEmpty ? "" : instance.getHTML();
      setHtml(next);
      onChangeRef.current(next);
    },
  });

  // Toolbar state, recomputed only when the relevant parts change.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            format: e.isActive("heading", { level: 2 })
              ? "h2"
              : e.isActive("heading", { level: 3 })
                ? "h3"
                : e.isActive("heading", { level: 4 })
                  ? "h4"
                  : e.isActive("codeBlock")
                    ? "pre"
                    : "paragraph",
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            strike: e.isActive("strike"),
            code: e.isActive("code"),
            bulletList: e.isActive("bulletList"),
            orderedList: e.isActive("orderedList"),
            blockquote: e.isActive("blockquote"),
            link: e.isActive("link"),
            align: ["center", "right", "justify"].find((a) => e.isActive({ textAlign: a })) || "left",
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
            inList: e.isActive("listItem"),
          }
        : null,
  });

  // Escape leaves fullscreen.
  useEffect(() => {
    if (!fullscreen) return undefined;
    const onKey = (event) => event.key === "Escape" && !linkOpen && !mediaOpen && setFullscreen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [fullscreen, linkOpen, mediaOpen]);

  const switchMode = (next) => {
    if (next === mode || !editor) return;
    if (next === "visual") editor.commands.setContent(html || "", { emitUpdate: false });
    setMode(next);
  };

  const setFormat = (format) => {
    const chain = editor.chain().focus();
    if (format === "paragraph") chain.setParagraph().run();
    else if (format === "pre") chain.toggleCodeBlock().run();
    else chain.setHeading({ level: Number(format.slice(1)) }).run();
  };

  const insertImage = useCallback(
    ({ url, alt }) => {
      if (mode === "visual" && editor) {
        editor.chain().focus().setImage({ src: url, alt }).run();
        return;
      }
      // Text mode: insert the tag at the cursor.
      const textarea = textRef.current;
      const tag = `<img src="${url}" alt="${alt.replace(/"/g, "&quot;")}">`;
      const start = textarea?.selectionStart ?? html.length;
      const end = textarea?.selectionEnd ?? html.length;
      const next = `${html.slice(0, start)}${tag}${html.slice(end)}`;
      setHtml(next);
      onChange(next);
    },
    [editor, html, mode, onChange]
  );

  const applyLink = ({ href, newTab }) => {
    const chain = editor.chain().focus().extendMarkRange("link");
    if (!href) chain.unsetLink().run();
    else chain.setLink({ href, target: newTab ? "_blank" : null }).run();
  };

  const words = wordCount(html);
  const disabled = mode !== "visual" || !editor;
  const run = (fn) => () => fn(editor.chain().focus()).run();

  return (
    <div className={cn(styles.wrapper, fullscreen && styles.fullscreen, error && styles.invalid)}>
      {/* ---------- Media button + Visual/Text tabs ---------- */}
      <div className={cn(styles.top, "flex flex-wrap items-center justify-between gap-3")}>
        <button type="button" onClick={() => setMediaOpen(true)} className={styles.mediaButton}>
          <Icon name="image" size={18} />
          Add Media
        </button>
        <div role="tablist" aria-label="Editor mode" className={styles.tabs}>
          {["visual", "text"].map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={mode === tab}
              onClick={() => switchMode(tab)}
              className={cn(styles.tab, mode === tab && styles.tabActive)}
            >
              {tab === "visual" ? "Visual" : "Text"}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- Toolbar ---------- */}
      <div role="toolbar" aria-label="Formatting" className={styles.toolbar}>
        <div className="flex flex-wrap items-center gap-0.5">
          <label className="sr-only" htmlFor="editor-format">
            Paragraph style
          </label>
          <select
            id="editor-format"
            value={state?.format || "paragraph"}
            onChange={(event) => setFormat(event.target.value)}
            disabled={disabled}
            className={styles.select}
          >
            {FORMATS.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
          <Divider />
          <ToolButton icon="bold" label="Bold" shortcut="Ctrl+B" active={state?.bold} disabled={disabled} onClick={run((c) => c.toggleBold())} />
          <ToolButton icon="italic" label="Italic" shortcut="Ctrl+I" active={state?.italic} disabled={disabled} onClick={run((c) => c.toggleItalic())} />
          <ToolButton icon="underline" label="Underline" shortcut="Ctrl+U" active={state?.underline} disabled={disabled} onClick={run((c) => c.toggleUnderline())} />
          <Divider />
          <ToolButton icon="listBullet" label="Bulleted list" active={state?.bulletList} disabled={disabled} onClick={run((c) => c.toggleBulletList())} />
          <ToolButton icon="listOrdered" label="Numbered list" active={state?.orderedList} disabled={disabled} onClick={run((c) => c.toggleOrderedList())} />
          <ToolButton icon="quote" label="Blockquote" active={state?.blockquote} disabled={disabled} onClick={run((c) => c.toggleBlockquote())} />
          <Divider />
          {[
            ["left", "alignLeft", "Align left"],
            ["center", "alignCenter", "Align centre"],
            ["right", "alignRight", "Align right"],
            ["justify", "alignJustify", "Justify"],
          ].map(([align, icon, label]) => (
            <ToolButton key={align} icon={icon} label={label} active={state?.align === align} disabled={disabled} onClick={run((c) => c.setTextAlign(align))} />
          ))}
          <Divider />
          <ToolButton icon="link" label="Insert or edit link" shortcut="Ctrl+K" active={state?.link} disabled={disabled} onClick={() => setLinkOpen(true)} />
          <ToolButton icon="unlink" label="Remove link" disabled={disabled || !state?.link} onClick={run((c) => c.extendMarkRange("link").unsetLink())} />
          <Divider />
          <ToolButton icon="toolbar" label="Toolbar toggle" active={showKitchenSink} onClick={() => setShowKitchenSink((open) => !open)} />
          <ToolButton icon={fullscreen ? "fullscreenExit" : "fullscreen"} label={fullscreen ? "Exit distraction-free mode" : "Distraction-free mode"} active={fullscreen} onClick={() => setFullscreen((on) => !on)} />
        </div>

        {showKitchenSink && (
          <div className={cn(styles.row2, "flex flex-wrap items-center gap-0.5")}>
            <ToolButton icon="strike" label="Strikethrough" active={state?.strike} disabled={disabled} onClick={run((c) => c.toggleStrike())} />
            <ToolButton icon="hr" label="Horizontal line" disabled={disabled} onClick={run((c) => c.setHorizontalRule())} />
            <ToolButton icon="code" label="Inline code" active={state?.code} disabled={disabled} onClick={run((c) => c.toggleCode())} />
            <ToolButton icon="clearFormat" label="Clear formatting" disabled={disabled} onClick={run((c) => c.unsetAllMarks().clearNodes())} />
            <Divider />
            <ToolButton icon="outdent" label="Decrease indent" disabled={disabled || !state?.inList} onClick={run((c) => c.liftListItem("listItem"))} />
            <ToolButton icon="indent" label="Increase indent" disabled={disabled || !state?.inList} onClick={run((c) => c.sinkListItem("listItem"))} />
            <Divider />
            <ToolButton icon="undo" label="Undo" shortcut="Ctrl+Z" disabled={disabled || !state?.canUndo} onClick={run((c) => c.undo())} />
            <ToolButton icon="redo" label="Redo" shortcut="Ctrl+Shift+Z" disabled={disabled || !state?.canRedo} onClick={run((c) => c.redo())} />
          </div>
        )}
      </div>

      {/* ---------- Editing area ---------- */}
      <div
        className={styles.area}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k" && mode === "visual") {
            event.preventDefault();
            setLinkOpen(true);
          }
        }}
      >
        {mode === "visual" ? (
          editor ? (
            <EditorContent editor={editor} />
          ) : (
            <div className={cn(styles.loading, "flex items-center gap-3 text-sm text-ink-600")} role="status">
              <span className={styles.spinner} aria-hidden="true" /> Loading editor…
            </div>
          )
        ) : (
          <>
            <label htmlFor="editor-html" className="sr-only">
              Article HTML
            </label>
            <textarea
              id="editor-html"
              ref={textRef}
              value={html}
              onChange={(event) => {
                setHtml(event.target.value);
                onChange(event.target.value);
              }}
              spellCheck={false}
              className={styles.code}
            />
          </>
        )}
      </div>

      {/* ---------- Status bar ---------- */}
      <div className={cn(styles.status, "flex flex-wrap items-center justify-between gap-2")}>
        <span>
          Word count: <strong>{words.toLocaleString("en-GB")}</strong>
          {words > 0 && <> · {readingMinutes(html)} min read</>}
        </span>
        <span className="hidden sm:inline">{mode === "visual" ? "Ctrl+K adds a link" : "Editing HTML"}</span>
      </div>

      <LinkDialog
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        initialHref={editor?.getAttributes("link").href || ""}
        initialNewTab={editor?.getAttributes("link").target === "_blank"}
        onSubmit={(link) => {
          applyLink(link);
          setLinkOpen(false);
        }}
      />
      <MediaModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        mode="insert"
        uploadName={uploadName}
        onSelect={(image) => {
          insertImage(image);
          setMediaOpen(false);
        }}
      />
    </div>
  );
}
