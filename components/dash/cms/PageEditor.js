"use client";

import { ExternalLink, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { errorText, field, fieldBorder, hint, label } from "../admin/fields";
import { DEMO_SAVED, useToast } from "../Toast";
import ImageField from "./ImageField";
import RichTextEditor from "./RichTextEditor";
import { useSave } from "./useSave";

/**
 * Fixed website pages (About, Academics, Admission, legal). PATCH /api/cms/pages/:id
 * Pages are part of the site's menu, so they are edited, never created or deleted here.
 */
export default function PageEditor({ page, demo = false }) {
    const router = useRouter();
    const toast = useToast();
    const { busy, error, fieldErrors: fe, save } = useSave();
    const [v, setV] = useState({ title: page.title, summary: page.summary, bodyHtml: page.bodyHtml, cover: page.cover, isPublished: page.isPublished });
    const set = (k) => (e) => setV((s) => ({ ...s, [k]: e?.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e }));

    async function submit(e) {
        e.preventDefault();
        if (demo) return toast(DEMO_SAVED, { title: "Page saved", tone: "info" });
        const data = await save(`/api/cms/pages/${page.id}`, "PATCH", {
            title: v.title,
            summary: v.summary,
            bodyHtml: v.bodyHtml,
            cover: v.cover ? { path: v.cover.path, alt: v.cover.alt, width: v.cover.width, height: v.cover.height } : null,
            isPublished: v.isPublished,
        });
        if (!data) return;
        toast("The website updates within a few seconds.", { title: "Page saved" });
        router.refresh();
    }

    return (
        <form onSubmit={submit} noValidate className="grid gap-5 lg:grid-cols-[1fr_340px]">
            <div className="min-w-0 space-y-5">
                <label className="block">
                    <span className={label}>Title *</span>
                    <input value={v.title} onChange={set("title")} className={`${field} ${fieldBorder(fe.title)} text-[17px] font-medium`} aria-invalid={!!fe.title} />
                    {fe.title && <span className={errorText}>{fe.title}</span>}
                </label>
                <label className="block">
                    <span className={label}>Summary *</span>
                    <textarea value={v.summary} onChange={set("summary")} rows={2} maxLength={300} className={`${field} ${fieldBorder(fe.summary)}`} aria-invalid={!!fe.summary} />
                    {fe.summary ? <span className={errorText}>{fe.summary}</span> : <span className={hint}>Shown under the page title and in Google results.</span>}
                </label>
                <div>
                    <span className={label}>Page text</span>
                    <div className="mt-1">
                        <RichTextEditor value={v.bodyHtml} onChange={set("bodyHtml")} label="Page text" minHeight={360} invalid={!!fe.bodyHtml} />
                    </div>
                    {fe.bodyHtml && <span className={errorText}>{fe.bodyHtml}</span>}
                </div>
            </div>
            <aside className="space-y-5">
                <ImageField value={v.cover} onChange={set("cover")} folder="pages" label="Header photo" demo={demo} error={fe.cover} />
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-4">
                    <input type="checkbox" checked={v.isPublished} onChange={set("isPublished")} className="mt-1 size-4 accent-[var(--brand)]" />
                    <span>
                        <span className="block text-[14.5px] text-ink">Show on the website</span>
                        <span className="text-[12.5px] text-ink-soft">Untick to hide the page (its link shows “not found”).</span>
                    </span>
                </label>
                {error && (
                    <p role="alert" className="rounded-xl bg-coral-soft px-4 py-3 text-[14.5px] text-ink">
                        {error}
                    </p>
                )}
                <div className="flex gap-2">
                    <button type="submit" disabled={busy} className="btn-primary min-h-11 flex-1 text-[14.5px] disabled:opacity-60">
                        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
                        Save page
                    </button>
                    <Link href={page.href} target="_blank" className="btn-ghost min-h-11 text-[14px]" aria-label="View on website">
                        <ExternalLink className="size-4" aria-hidden="true" />
                    </Link>
                </div>
            </aside>
        </form>
    );
}
