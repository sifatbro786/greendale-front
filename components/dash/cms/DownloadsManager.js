"use client";

import { FileText, Loader2, Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { uploadFile } from "@/lib/api/client";
import { formatDate } from "@/lib/format";

import { errorText, field, fieldBorder, label } from "../admin/fields";
import { Badge } from "../ui";
import Modal from "../Modal";
import { DEMO_SAVED, useToast } from "../Toast";
import ConfirmDelete from "./ConfirmDelete";
import ListActions from "./ListActions";
import { useCollection } from "./useCollection";

const KINDS = [
    ["routine", "Class routine"],
    ["syllabus", "Syllabus"],
    ["exam-schedule", "Exam schedule"],
    ["form", "Form"],
];
const kindLabel = Object.fromEntries(KINDS);

/** Student Corner PDFs. /api/cms/downloads */
export default function DownloadsManager({ downloads, classOptions, demo = false }) {
    const c = useCollection({ base: "/api/cms/downloads", items: downloads, demo, noun: "Download" });
    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[13.5px] text-ink-soft">PDFs on the Student Corner page: routines, syllabus, exam schedules and forms.</p>
                <button type="button" onClick={() => c.setEditing("new")} className="btn-primary min-h-10 text-[14px]">
                    <Plus className="size-4" aria-hidden="true" /> Add PDF
                </button>
            </div>
            {c.list.length === 0 ? (
                <p className="rounded-xl border border-dashed border-line px-5 py-10 text-center text-[14.5px] text-ink-soft">
                    No files yet. The Student Corner shows a friendly “coming soon” until the first PDF is added.
                </p>
            ) : (
                <ul className="divide-y divide-line rounded-xl border border-line">
                    {c.list.map((d) => (
                        <li key={d.id} className="flex items-center gap-3 p-3">
                            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-coral-soft text-coral">
                                <FileText className="size-5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <a href={d.url} target="_blank" rel="noreferrer" className="font-medium text-ink hover:text-brand-deep">
                                    {d.title}
                                </a>
                                <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[13px] text-ink-soft">
                                    <Badge tone="blue">{kindLabel[d.kind] ?? d.kind}</Badge>
                                    {d.className && <Badge>{d.className}</Badge>}
                                    {d.publishedAt ? formatDate(d.publishedAt) : <Badge tone="yellow">Draft</Badge>}
                                </p>
                            </div>
                            <ListActions onEdit={() => c.setEditing(d)} onDelete={() => c.setRemoving(d)} />
                        </li>
                    ))}
                </ul>
            )}
            {c.editing && <DownloadForm key={c.editing === "new" ? "new" : c.editing.id} c={c} classOptions={classOptions} demo={demo} />}
            <ConfirmDelete item={c.removing} onCancel={() => c.setRemoving(null)} onConfirm={c.remove} text="The PDF is deleted from the website and the server. This cannot be undone." />
        </div>
    );
}

function DownloadForm({ c, classOptions, demo }) {
    const toast = useToast();
    const input = useRef(null);
    const item = c.editing === "new" ? null : c.editing;
    const [v, setV] = useState({
        title: item?.title ?? "",
        kind: item?.kind ?? "routine",
        classId: item?.classId ?? "",
        file: item ? { path: item.filePath, url: item.url, name: "Current file" } : null,
        published: item ? Boolean(item.publishedAt) : true,
    });
    const [uploading, setUploading] = useState(false);
    const fe = c.state.fieldErrors;
    const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

    async function pick(e) {
        const f = e.target.files?.[0];
        e.target.value = "";
        if (!f) return;
        if (demo) return toast(DEMO_SAVED, { title: "Upload", tone: "info" });
        if (f.size > 15 * 1024 * 1024) return toast("PDFs can be up to 15 MB.", { title: "Too large", tone: "error" });
        setUploading(true);
        const r = await uploadFile(f, { kind: "pdf", folder: "downloads" });
        setUploading(false);
        if (!r.ok) return toast(r.error.message, { title: "Upload failed", tone: "error" });
        setV((s) => ({ ...s, file: { path: r.data.path, url: r.data.url, name: f.name } }));
    }

    const submit = () =>
        c.save({
            title: v.title,
            kind: v.kind,
            classId: v.classId || null,
            filePath: v.file?.path ?? "",
            publishedAt: v.published ? (item?.publishedAt ?? new Date().toISOString()) : null,
        });

    return (
        <Modal
            open
            onClose={c.close}
            title={item ? "Edit PDF" : "Add PDF"}
            footer={
                <>
                    <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={c.close}>
                        Cancel
                    </button>
                    <button type="button" className="btn-primary min-h-10 text-[14px]" onClick={submit} disabled={c.state.busy || uploading}>
                        Save
                    </button>
                </>
            }
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                    <span className={label}>Title *</span>
                    <input value={v.title} onChange={set("title")} placeholder="e.g. Class III routine, 2026" className={`${field} ${fieldBorder(fe.title)}`} />
                    {fe.title && <span className={errorText}>{fe.title}</span>}
                </label>
                <label>
                    <span className={label}>Type</span>
                    <select value={v.kind} onChange={set("kind")} className={`${field} border-line`}>
                        {KINDS.map(([val, text]) => (
                            <option key={val} value={val}>
                                {text}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    <span className={label}>Class</span>
                    <select value={v.classId} onChange={set("classId")} className={`${field} border-line`}>
                        <option value="">All classes</option>
                        {classOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </label>
                <div className="sm:col-span-2">
                    <span className={label}>PDF file *</span>
                    <button
                        type="button"
                        onClick={() => input.current?.click()}
                        disabled={uploading}
                        className={`mt-1 flex w-full items-center gap-3 rounded-xl border-2 border-dashed px-4 py-3 text-left ${fe.filePath ? "border-coral" : "border-line"} hover:border-brand`}
                    >
                        {uploading ? <Loader2 className="size-5 animate-spin text-brand" aria-hidden="true" /> : <Upload className="size-5 text-ink-soft" aria-hidden="true" />}
                        <span className="min-w-0 flex-1 truncate text-[14.5px]">{uploading ? "Uploading…" : (v.file?.name ?? "Choose a PDF (up to 15 MB)")}</span>
                    </button>
                    {fe.filePath && <span className={errorText}>{fe.filePath}</span>}
                    <input ref={input} type="file" accept="application/pdf" onChange={pick} className="hidden" />
                </div>
                <label className="flex items-center gap-3 sm:col-span-2">
                    <input type="checkbox" checked={v.published} onChange={set("published")} className="size-4 accent-[var(--brand)]" />
                    <span className="text-[14.5px] text-ink">Show on the website</span>
                </label>
                {c.state.error && (
                    <p role="alert" className="rounded-xl bg-coral-soft px-4 py-3 text-[14.5px] text-ink sm:col-span-2">
                        {c.state.error}
                    </p>
                )}
            </div>
        </Modal>
    );
}
