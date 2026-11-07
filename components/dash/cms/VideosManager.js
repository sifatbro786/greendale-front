"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { errorText, field, fieldBorder, hint, label } from "../admin/fields";
import { Badge } from "../ui";
import Modal from "../Modal";
import ConfirmDelete from "./ConfirmDelete";
import ImageField from "./ImageField";
import ListActions from "./ListActions";
import { useCollection } from "./useCollection";

/** Website videos: YouTube links (seeded campus video files stay editable). /api/cms/videos */
export default function VideosManager({ videos, demo = false }) {
    const c = useCollection({ base: "/api/cms/videos", items: videos, demo, noun: "Video" });
    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[13.5px] text-ink-soft">Shown in the Gallery under Videos, in this order. New videos are YouTube links (no large files on the server).</p>
                <button type="button" onClick={() => c.setEditing("new")} className="btn-primary min-h-10 text-[14px]">
                    <Plus className="size-4" aria-hidden="true" /> Add YouTube video
                </button>
            </div>
            <ul className="divide-y divide-line rounded-xl border border-line">
                {c.list.map((v, i) => (
                    <li key={v.id} className="flex items-center gap-3 p-3">
                        {/* eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail */}
                        <img
                            src={v.poster?.url ?? (v.youtubeId ? `https://i.ytimg.com/vi/${v.youtubeId}/mqdefault.jpg` : "")}
                            alt=""
                            className="aspect-video w-28 shrink-0 rounded-lg bg-paper object-cover"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-ink">{v.title}</p>
                            <p className="mt-0.5 flex flex-wrap gap-1.5">
                                <Badge tone={v.kind === "youtube" ? "red" : "blue"}>{v.kind === "youtube" ? "YouTube" : "Video file"}</Badge>
                                <Badge>{v.orientation}</Badge>
                                {!v.isPublished && <Badge tone="yellow">Hidden</Badge>}
                            </p>
                        </div>
                        <ListActions
                            first={i === 0}
                            last={i === c.list.length - 1}
                            onUp={() => c.move(i, -1)}
                            onDown={() => c.move(i, 1)}
                            onEdit={() => c.setEditing(v)}
                            onDelete={() => c.setRemoving(v)}
                        />
                    </li>
                ))}
            </ul>
            {c.editing && <VideoForm key={c.editing === "new" ? "new" : c.editing.id} c={c} demo={demo} />}
            <ConfirmDelete item={c.removing} onCancel={() => c.setRemoving(null)} onConfirm={c.remove} />
        </div>
    );
}

function VideoForm({ c, demo }) {
    const item = c.editing === "new" ? null : c.editing;
    const isFile = item?.kind === "file";
    const [v, setV] = useState({
        title: item?.title ?? "",
        youtube: item?.youtubeId ? `https://youtu.be/${item.youtubeId}` : "",
        orientation: item?.orientation ?? "landscape",
        poster: item?.poster ?? null,
        isPublished: item?.isPublished ?? true,
    });
    const fe = c.state.fieldErrors;
    const set = (k) => (e) => setV((s) => ({ ...s, [k]: e?.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e }));
    const submit = () =>
        c.save({
            title: v.title,
            ...(!isFile && { youtube: v.youtube }),
            orientation: v.orientation,
            poster: v.poster ? { path: v.poster.path, alt: v.poster.alt, width: v.poster.width, height: v.poster.height } : null,
            isPublished: v.isPublished,
        });
    return (
        <Modal
            open
            onClose={c.close}
            title={item ? "Edit video" : "Add YouTube video"}
            footer={
                <>
                    <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={c.close}>
                        Cancel
                    </button>
                    <button type="button" className="btn-primary min-h-10 text-[14px]" onClick={submit} disabled={c.state.busy}>
                        Save
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <label className="block">
                    <span className={label}>Title *</span>
                    <input value={v.title} onChange={set("title")} className={`${field} ${fieldBorder(fe.title)}`} />
                    {fe.title && <span className={errorText}>{fe.title}</span>}
                </label>
                {!isFile && (
                    <label className="block">
                        <span className={label}>YouTube link *</span>
                        <input value={v.youtube} onChange={set("youtube")} placeholder="https://youtu.be/…" inputMode="url" className={`${field} ${fieldBorder(fe.youtube)}`} />
                        {fe.youtube ? <span className={errorText}>{fe.youtube}</span> : <span className={hint}>Copy the link from YouTube’s Share button.</span>}
                    </label>
                )}
                <label className="block">
                    <span className={label}>Shape</span>
                    <select value={v.orientation} onChange={set("orientation")} className={`${field} border-line`}>
                        <option value="landscape">Landscape (wide)</option>
                        <option value="portrait">Portrait (phone / Shorts)</option>
                    </select>
                </label>
                <ImageField value={v.poster} onChange={set("poster")} folder="gallery" label="Cover image (optional)" demo={demo} />
                <label className="flex items-center gap-3">
                    <input type="checkbox" checked={v.isPublished} onChange={set("isPublished")} className="size-4 accent-[var(--brand)]" />
                    <span className="text-[14.5px] text-ink">Show on the website</span>
                </label>
                {c.state.error && (
                    <p role="alert" className="rounded-xl bg-coral-soft px-4 py-3 text-[14.5px] text-ink">
                        {c.state.error}
                    </p>
                )}
            </div>
        </Modal>
    );
}
