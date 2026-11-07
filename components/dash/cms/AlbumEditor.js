"use client";

import { ArrowLeft, ArrowRight, ExternalLink, ImagePlus, Loader2, Save, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { api, uploadFile } from "@/lib/api/client";

import { errorText, field, fieldBorder, hint, label } from "../admin/fields";
import Modal from "../Modal";
import { DEMO_SAVED, useToast } from "../Toast";
import { useSave } from "./useSave";

const MAX_MB = 10;

/**
 * Gallery album: details + photos (bulk upload, cover, description, order, delete).
 * POST/PATCH/DELETE /api/cms/albums[/:id], POST /:id/images, PUT /:id/images/order, PATCH|DELETE /:id/images/:imageId
 * @param {{ album?: any, demo?: boolean }} props
 */
export default function AlbumEditor({ album, demo = false }) {
    const router = useRouter();
    const toast = useToast();
    const fileInput = useRef(null);
    const { busy, error, fieldErrors: fe, save } = useSave();
    const isNew = !album;
    const [v, setV] = useState({ title: album?.title ?? "", date: album?.date ?? "", description: album?.description ?? "", isPublished: album?.isPublished ?? true });
    const [images, setImages] = useState(album?.images ?? []);
    const [cover, setCover] = useState(album?.coverImageId ?? null);
    const [progress, setProgress] = useState(null); // { done, total, failed }
    const [confirmDelete, setConfirmDelete] = useState(false);
    const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

    const apply = (data) => {
        if (!data) return;
        setImages(data.images);
        setCover(data.coverImageId);
        router.refresh();
    };

    async function submit(e) {
        e.preventDefault();
        if (demo) return toast(DEMO_SAVED, { title: "Album saved", tone: "info" });
        const body = { title: v.title, date: v.date || null, description: v.description || null, isPublished: v.isPublished };
        const data = await save(isNew ? "/api/cms/albums" : `/api/cms/albums/${album.id}`, isNew ? "POST" : "PATCH", body);
        if (!data) return;
        toast(isNew ? "Now add photos to the album." : "The website updates within a few seconds.", { title: isNew ? "Album created" : "Album saved" });
        if (isNew) router.replace(`/admin/website/gallery/${data.id}`);
        router.refresh();
    }

    /** Uploads one by one (gentle on a 1 vCPU server and on phone data), then adds them in one request. */
    async function addPhotos(e) {
        const files = [...(e.target.files ?? [])];
        e.target.value = "";
        if (!files.length) return;
        if (demo) return toast(DEMO_SAVED, { title: "Upload photos", tone: "info" });
        const ok = [];
        let failed = 0;
        setProgress({ done: 0, total: files.length, failed: 0 });
        for (const [i, file] of files.entries()) {
            if (file.size > MAX_MB * 1024 * 1024) failed++;
            else {
                const r = await uploadFile(file, { kind: "image", folder: "gallery" });
                if (r.ok) ok.push({ path: r.data.path, thumbPath: r.data.thumbPath, width: r.data.width, height: r.data.height, alt: "" });
                else failed++;
            }
            setProgress({ done: i + 1, total: files.length, failed });
        }
        for (let i = 0; i < ok.length; i += 50) {
            const r = await api(`/api/cms/albums/${album.id}/images`, { method: "POST", body: { images: ok.slice(i, i + 50) } });
            if (r.ok) apply(r.data);
            else toast(r.error.message, { title: "Not saved", tone: "error" });
        }
        setProgress(null);
        toast(failed ? `${ok.length} added, ${failed} could not be read (too large or not a photo).` : `${ok.length} photo${ok.length === 1 ? "" : "s"} added.`, { title: "Photos", tone: failed ? "info" : "success" });
    }

    async function call(path, method, body, msg) {
        if (demo) return toast(DEMO_SAVED, { title: "Looks good!", tone: "info" });
        const r = await api(path, { method, body });
        if (!r.ok) return toast(r.error.message, { title: "Not saved", tone: "error" });
        apply(r.data);
        if (msg) toast(msg, { title: "Saved" });
    }

    const move = (idx, dir) => {
        const next = [...images];
        const j = idx + dir;
        if (j < 0 || j >= next.length) return;
        [next[idx], next[j]] = [next[j], next[idx]];
        setImages(next);
        call(`/api/cms/albums/${album.id}/images/order`, "PUT", { ids: next.map((g) => g.id) });
    };

    async function removeAlbum() {
        if (demo) return (setConfirmDelete(false), toast(DEMO_SAVED, { title: "Album deleted", tone: "info" }));
        const r = await api(`/api/cms/albums/${album.id}`, { method: "DELETE" });
        setConfirmDelete(false);
        if (!r.ok) return toast(r.error.message, { title: "Not deleted", tone: "error" });
        toast(`"${album.title}" was deleted.`, { title: "Album deleted" });
        router.push("/admin/website?tab=gallery");
        router.refresh();
    }

    return (
        <div className="space-y-6">
            <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-[1fr_200px]">
                <label>
                    <span className={label}>Album title *</span>
                    <input value={v.title} onChange={set("title")} className={`${field} ${fieldBorder(fe.title)}`} placeholder="e.g. Annual Sports Day 2026" aria-invalid={!!fe.title} />
                    {fe.title && <span className={errorText}>{fe.title}</span>}
                </label>
                <label>
                    <span className={label}>Date</span>
                    <input type="date" value={v.date} onChange={set("date")} className={`${field} ${fieldBorder(fe.date)}`} />
                </label>
                <label className="sm:col-span-2">
                    <span className={label}>Description</span>
                    <input value={v.description} onChange={set("description")} maxLength={500} className={`${field} ${fieldBorder(fe.description)}`} placeholder="One line about the event" />
                </label>
                <label className="flex items-center gap-3 sm:col-span-2">
                    <input type="checkbox" checked={v.isPublished} onChange={set("isPublished")} className="size-4 accent-[var(--brand)]" />
                    <span className="text-[14.5px] text-ink">Show on the website</span>
                    <span className="text-[12.5px] text-ink-soft">(albums without photos stay hidden)</span>
                </label>
                {error && (
                    <p role="alert" className="rounded-xl bg-coral-soft px-4 py-3 text-[14.5px] text-ink sm:col-span-2">
                        {error}
                    </p>
                )}
                <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                    <button type="submit" disabled={busy} className="btn-primary min-h-11 text-[14.5px] disabled:opacity-60">
                        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
                        {isNew ? "Create album" : "Save details"}
                    </button>
                    {!isNew && album.isPublished && images.length > 0 && (
                        <Link href={`/gallery/${album.slug}`} target="_blank" className="btn-ghost min-h-11 text-[14px]">
                            <ExternalLink className="size-4" aria-hidden="true" /> View
                        </Link>
                    )}
                    {!isNew && (
                        <button type="button" onClick={() => setConfirmDelete(true)} className="ml-auto flex items-center gap-2 text-[13.5px] font-medium text-ink-soft hover:text-coral">
                            <Trash2 className="size-4" aria-hidden="true" /> Delete album
                        </button>
                    )}
                </div>
            </form>

            {!isNew && (
                <section>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
                        <div>
                            <h2 className="text-[16px] font-semibold text-ink">Photos ({images.length})</h2>
                            <p className={hint}>Up to {MAX_MB} MB each. Photos are resized and location data is removed.</p>
                        </div>
                        <button type="button" onClick={() => fileInput.current?.click()} disabled={!!progress} className="btn-primary min-h-11 text-[14.5px] disabled:opacity-60">
                            {progress ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="size-4" aria-hidden="true" />}
                            {progress ? `Uploading ${progress.done} / ${progress.total}` : "Add photos"}
                        </button>
                        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos} className="hidden" />
                    </div>

                    {images.length === 0 ? (
                        <button type="button" onClick={() => fileInput.current?.click()} className="mt-4 flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line bg-paper/50 px-6 py-12 text-ink-soft hover:border-brand hover:text-brand-deep">
                            <ImagePlus className="size-8" aria-hidden="true" />
                            <span className="font-medium">Choose photos from your phone or computer</span>
                        </button>
                    ) : (
                        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                            {images.map((g, i) => (
                                <li key={g.id} className={`overflow-hidden rounded-xl border bg-white ${cover === g.id ? "border-brand ring-2 ring-brand/30" : "border-line"}`}>
                                    <div className="relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                                        <img src={g.thumbUrl} alt="" loading="lazy" className="aspect-[4/3] w-full bg-paper object-cover" />
                                        {cover === g.id && <span className="absolute top-2 left-2 rounded-full bg-sun px-2 py-0.5 text-[11.5px] font-semibold text-ink">Cover</span>}
                                    </div>
                                    <div className="space-y-2 p-2">
                                        <input
                                            defaultValue={g.alt}
                                            onBlur={(e) => e.target.value !== g.alt && call(`/api/cms/albums/${album.id}/images/${g.id}`, "PATCH", { alt: e.target.value })}
                                            placeholder="Describe the photo"
                                            aria-label={`Description of photo ${i + 1}`}
                                            className="w-full rounded-lg border border-line px-2.5 py-1.5 text-[13.5px] outline-none focus:border-brand"
                                        />
                                        <div className="flex items-center justify-between">
                                            <div className="flex">
                                                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="grid size-9 place-items-center rounded-lg text-ink-soft hover:bg-paper disabled:opacity-30" aria-label="Move earlier">
                                                    <ArrowLeft className="size-4" aria-hidden="true" />
                                                </button>
                                                <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="grid size-9 place-items-center rounded-lg text-ink-soft hover:bg-paper disabled:opacity-30" aria-label="Move later">
                                                    <ArrowRight className="size-4" aria-hidden="true" />
                                                </button>
                                            </div>
                                            <div className="flex">
                                                <button type="button" onClick={() => call(`/api/cms/albums/${album.id}`, "PATCH", { coverImageId: g.id }, "Cover photo changed.")} disabled={cover === g.id} className="grid size-9 place-items-center rounded-lg text-ink-soft hover:bg-sun-soft hover:text-ink disabled:opacity-30" aria-label="Use as cover">
                                                    <Star className="size-4" aria-hidden="true" />
                                                </button>
                                                <button type="button" onClick={() => call(`/api/cms/albums/${album.id}/images/${g.id}`, "DELETE")} className="grid size-9 place-items-center rounded-lg text-ink-soft hover:bg-coral-soft hover:text-coral" aria-label="Delete photo">
                                                    <Trash2 className="size-4" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}

            {!isNew && (
                <Modal
                    open={confirmDelete}
                    onClose={() => setConfirmDelete(false)}
                    title={`Delete ${album.title}?`}
                    size="sm"
                    footer={
                        <>
                            <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={() => setConfirmDelete(false)}>
                                Cancel
                            </button>
                            <button type="button" className="btn-primary min-h-10 bg-coral! text-[14px]" onClick={removeAlbum}>
                                Delete album
                            </button>
                        </>
                    }
                >
                    <p className="text-[15px] text-ink-soft">The album and all {images.length} photos are deleted from the website and the server. This cannot be undone. Untick “Show on the website” to only hide it.</p>
                </Modal>
            )}
        </div>
    );
}
