"use client";

import { ExternalLink, Loader2, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/lib/api/client";

import { errorText, field, fieldBorder, hint, label } from "../admin/fields";
import Modal from "../Modal";
import { DEMO_SAVED, useToast } from "../Toast";
import ImageField from "./ImageField";
import RichTextEditor from "./RichTextEditor";
import { fromDhakaInput, nowDhakaInput, toDhakaInput } from "./time";
import { useSave } from "./useSave";

/**
 * News & events post. POST /api/cms/news · PATCH/DELETE /api/cms/news/:id
 * Status: draft (publishedAt null), published now, or scheduled (future time).
 * @param {{ post?: any, albums: { id: string, title: string }[], demo?: boolean }} props
 */
export default function NewsEditor({ post, albums, demo = false }) {
    const router = useRouter();
    const toast = useToast();
    const { busy, error, fieldErrors: fe, save } = useSave();
    const isNew = !post;
    const future = post?.publishedAt && new Date(post.publishedAt) > new Date();
    const [v, setV] = useState({
        title: post?.title ?? "",
        slug: post?.slug ?? "",
        excerpt: post?.excerpt ?? "",
        bodyHtml: post?.bodyHtml ?? "",
        cover: post?.cover ?? null,
        albumId: post?.albumId ?? "",
        status: !post ? "published" : !post.publishedAt ? "draft" : future ? "scheduled" : "published",
        when: post?.publishedAt ? toDhakaInput(post.publishedAt) : nowDhakaInput(),
    });
    const [confirmDelete, setConfirmDelete] = useState(false);
    const set = (k) => (e) => setV((s) => ({ ...s, [k]: e?.target ? e.target.value : e }));

    async function submit(e) {
        e.preventDefault();
        if (demo) return toast(DEMO_SAVED, { title: "Post saved", tone: "info" });
        const publishedAt = v.status === "draft" ? null : v.status === "scheduled" ? fromDhakaInput(v.when) : post?.publishedAt && !future ? post.publishedAt : new Date().toISOString();
        const body = {
            title: v.title,
            bodyHtml: v.bodyHtml,
            excerpt: v.excerpt,
            cover: v.cover && { path: v.cover.path, alt: v.cover.alt, width: v.cover.width, height: v.cover.height },
            publishedAt,
            albumId: v.albumId || null,
            ...(!isNew && v.slug && v.slug !== post.slug && { slug: v.slug }),
        };
        const data = await save(isNew ? "/api/cms/news" : `/api/cms/news/${post.id}`, isNew ? "POST" : "PATCH", body);
        if (!data) return;
        toast(v.status === "draft" ? "Saved as a draft. It is not on the website yet." : v.status === "scheduled" ? "It will appear on the website at the chosen time." : "The website updates within a few seconds.", { title: "Post saved" });
        if (isNew) router.replace(`/admin/website/news/${data.id}`);
        router.refresh();
    }

    async function remove() {
        if (demo) return (setConfirmDelete(false), toast(DEMO_SAVED, { title: "Post deleted", tone: "info" }));
        const r = await api(`/api/cms/news/${post.id}`, { method: "DELETE" });
        setConfirmDelete(false);
        if (!r.ok) return toast(r.error.message, { title: "Not deleted", tone: "error" });
        toast(`"${post.title}" was deleted.`, { title: "Post deleted" });
        router.push("/admin/website?tab=news");
        router.refresh();
    }

    return (
        <form onSubmit={submit} noValidate className="grid gap-5 lg:grid-cols-[1fr_340px]">
            <div className="min-w-0 space-y-5">
                <label className="block">
                    <span className={label}>Title *</span>
                    <input value={v.title} onChange={set("title")} className={`${field} ${fieldBorder(fe.title)} text-[17px] font-medium`} placeholder="e.g. Annual Sports Day 2026" aria-invalid={!!fe.title} />
                    {fe.title && <span className={errorText}>{fe.title}</span>}
                </label>
                <div>
                    <span className={label}>Story *</span>
                    <div className="mt-1">
                        <RichTextEditor value={v.bodyHtml} onChange={set("bodyHtml")} label="Story" invalid={!!fe.bodyHtml} />
                    </div>
                    {fe.bodyHtml && <span className={errorText}>{fe.bodyHtml}</span>}
                </div>
                <label className="block">
                    <span className={label}>Short summary</span>
                    <textarea value={v.excerpt} onChange={set("excerpt")} rows={2} maxLength={300} className={`${field} ${fieldBorder(fe.excerpt)}`} placeholder="Shown on the news list and in Google. Leave empty to use the first lines of the story." />
                </label>
            </div>

            <aside className="space-y-5">
                <ImageField value={v.cover} onChange={set("cover")} folder="news" label="Cover photo" required demo={demo} error={fe.cover} />

                <fieldset className="rounded-2xl border border-line p-4">
                    <legend className="px-1 text-[14px] font-medium text-ink">Status</legend>
                    {[
                        ["published", "Published", "Visible on the website"],
                        ["scheduled", "Scheduled", "Appears at the time below"],
                        ["draft", "Draft", "Only staff can see it here"],
                    ].map(([val, text, sub]) => (
                        <label key={val} className="flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2 hover:bg-paper">
                            <input type="radio" name="status" value={val} checked={v.status === val} onChange={set("status")} className="mt-1 size-4 accent-[var(--brand)]" />
                            <span>
                                <span className="block text-[14.5px] text-ink">{text}</span>
                                <span className="text-[12.5px] text-ink-soft">{sub}</span>
                            </span>
                        </label>
                    ))}
                    {v.status === "scheduled" && (
                        <label className="mt-2 block px-2">
                            <span className="text-[13px] text-ink-soft">Publish at (Dhaka time)</span>
                            <input type="datetime-local" value={v.when} onChange={set("when")} className={`${field} ${fieldBorder(fe.publishedAt)}`} />
                            {fe.publishedAt && <span className={errorText}>{fe.publishedAt}</span>}
                        </label>
                    )}
                </fieldset>

                <label className="block">
                    <span className={label}>Photo album</span>
                    <select value={v.albumId} onChange={set("albumId")} className={`${field} border-line`}>
                        <option value="">None</option>
                        {albums.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.title}
                            </option>
                        ))}
                    </select>
                    <span className={hint}>Links the post to a gallery album.</span>
                </label>

                {!isNew && (
                    <label className="block">
                        <span className={label}>Web address</span>
                        <input value={v.slug} onChange={set("slug")} className={`${field} ${fieldBorder(fe.slug)} font-mono text-[14px]`} />
                        {fe.slug ? <span className={errorText}>{fe.slug}</span> : <span className={hint}>/news/{v.slug || "…"}. Changing it breaks links already shared.</span>}
                    </label>
                )}

                {error && (
                    <p role="alert" className="rounded-xl bg-coral-soft px-4 py-3 text-[14.5px] text-ink">
                        {error}
                    </p>
                )}
                <div className="flex flex-wrap gap-2">
                    <button type="submit" disabled={busy} className="btn-primary min-h-11 flex-1 text-[14.5px] disabled:opacity-60">
                        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
                        {isNew ? "Create post" : "Save post"}
                    </button>
                    {!isNew && post.publishedAt && !future && (
                        <Link href={`/news/${post.slug}`} target="_blank" className="btn-ghost min-h-11 text-[14px]" aria-label="View on website">
                            <ExternalLink className="size-4" aria-hidden="true" />
                        </Link>
                    )}
                </div>
                {!isNew && (
                    <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 text-[13.5px] font-medium text-ink-soft hover:text-coral">
                        <Trash2 className="size-4" aria-hidden="true" /> Delete this post
                    </button>
                )}
            </aside>

            {!isNew && (
                <Modal
                    open={confirmDelete}
                    onClose={() => setConfirmDelete(false)}
                    title="Delete this post?"
                    size="sm"
                    footer={
                        <>
                            <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={() => setConfirmDelete(false)}>
                                Cancel
                            </button>
                            <button type="button" className="btn-primary min-h-10 bg-coral! text-[14px]" onClick={remove}>
                                Delete
                            </button>
                        </>
                    }
                >
                    <p className="text-[15px] text-ink-soft">“{post.title}” and its cover photo are removed from the website. This cannot be undone. Choose Draft instead to only hide it.</p>
                </Modal>
            )}
        </form>
    );
}
