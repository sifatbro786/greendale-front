"use client";

import { Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, Pilcrow, Quote, Unlink } from "lucide-react";
import { useEffect, useRef } from "react";

const TOOLS = [
    { icon: Bold, title: "Bold", cmd: "bold" },
    { icon: Italic, title: "Italic", cmd: "italic" },
    { icon: Heading2, title: "Heading", cmd: "formatBlock", arg: "<h2>" },
    { icon: Heading3, title: "Small heading", cmd: "formatBlock", arg: "<h3>" },
    { icon: Pilcrow, title: "Normal text", cmd: "formatBlock", arg: "<p>" },
    { icon: List, title: "Bullet list", cmd: "insertUnorderedList" },
    { icon: ListOrdered, title: "Numbered list", cmd: "insertOrderedList" },
    { icon: Quote, title: "Quote", cmd: "formatBlock", arg: "<blockquote>" },
    { icon: Link2, title: "Add link", cmd: "link" },
    { icon: Unlink, title: "Remove link", cmd: "unlink" },
];

/**
 * Small rich-text editor for school staff (no dependency): bold, italic, headings, lists, quote, links.
 * Paste is plain text, so Word/Facebook formatting never leaks in. The API sanitises every save
 * (sanitize-html allowlist), so this editor is a convenience, not a security boundary.
 * @param {{ value: string, onChange: (html: string) => void, label?: string, invalid?: boolean, minHeight?: number }} props
 */
export default function RichTextEditor({ value, onChange, label = "Text", invalid = false, minHeight = 260 }) {
    const ref = useRef(null);

    // Set the initial HTML once; afterwards the DOM is the source of truth (re-setting would move the caret).
    useEffect(() => {
        if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value || "";
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const emit = () => onChange(ref.current?.innerHTML ?? "");
    const run = (cmd, arg) => {
        ref.current?.focus();
        document.execCommand(cmd, false, arg);
        emit();
    };
    const link = () => {
        const url = window.prompt("Link address (https://…)", "https://");
        if (!url || url === "https://") return;
        if (!/^(https?:\/\/|mailto:|tel:|\/)/i.test(url)) return;
        run("createLink", url);
    };
    const onPaste = (e) => {
        e.preventDefault();
        document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
        emit();
    };

    const onTool = (t) => (t.cmd === "link" ? link() : run(t.cmd, t.arg));

    return (
        <div className={`overflow-hidden rounded-xl border bg-white focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10 ${invalid ? "border-coral" : "border-line"}`}>
            <div role="toolbar" aria-label={`${label} formatting`} className="flex flex-wrap gap-0.5 border-b border-line bg-paper/70 p-1.5">
                {TOOLS.map((t) => (
                    <button key={t.title} type="button" title={t.title} aria-label={t.title} onMouseDown={(e) => e.preventDefault()} onClick={() => onTool(t)} className="grid size-9 place-items-center rounded-lg text-ink-soft hover:bg-white hover:text-ink">
                        <t.icon className="size-4.5" aria-hidden="true" />
                    </button>
                ))}
            </div>
            <div
                ref={ref}
                role="textbox"
                aria-multiline="true"
                aria-label={label}
                contentEditable
                suppressContentEditableWarning
                onInput={emit}
                onBlur={emit}
                onPaste={onPaste}
                style={{ minHeight }}
                className="rich-text max-w-none px-4 py-3 text-[16px] leading-relaxed text-ink outline-none [&_a]:text-brand-deep [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-brand/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6"
            />
        </div>
    );
}
