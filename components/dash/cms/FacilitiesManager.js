"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { errorText, field, fieldBorder, label } from "../admin/fields";
import { Badge } from "../ui";
import Modal from "../Modal";
import ConfirmDelete from "./ConfirmDelete";
import ImageField from "./ImageField";
import ListActions from "./ListActions";
import { useCollection } from "./useCollection";

const TONES = [
    ["brand", "Green"],
    ["sun", "Yellow"],
    ["sky", "Blue"],
    ["coral", "Coral"],
];

/** Facilities page cards. /api/cms/facilities */
export default function FacilitiesManager({ facilities, demo = false }) {
    const c = useCollection({ base: "/api/cms/facilities", items: facilities, demo, noun: "Facility" });
    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[13.5px] text-ink-soft">Cards on the Facilities page, in this order. Only list what the school really has.</p>
                <button type="button" onClick={() => c.setEditing("new")} className="btn-primary min-h-10 text-[14px]">
                    <Plus className="size-4" aria-hidden="true" /> Add facility
                </button>
            </div>
            <ul className="divide-y divide-line rounded-xl border border-line">
                {c.list.map((f, i) => (
                    <li key={f.id} className="flex items-center gap-3 p-3">
                        {/* eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail */}
                        <img src={f.image?.url ?? ""} alt="" className="aspect-[4/3] w-24 shrink-0 rounded-lg bg-paper object-cover" />
                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-ink">{f.title}</p>
                            <p className="line-clamp-2 text-[13.5px] text-ink-soft">{f.text}</p>
                            {!f.isPublished && (
                                <Badge tone="yellow" className="mt-1">
                                    Hidden
                                </Badge>
                            )}
                        </div>
                        <ListActions
                            first={i === 0}
                            last={i === c.list.length - 1}
                            onUp={() => c.move(i, -1)}
                            onDown={() => c.move(i, 1)}
                            onEdit={() => c.setEditing(f)}
                            onDelete={() => c.setRemoving(f)}
                        />
                    </li>
                ))}
            </ul>
            {c.editing && <FacilityForm key={c.editing === "new" ? "new" : c.editing.id} c={c} demo={demo} />}
            <ConfirmDelete item={c.removing} onCancel={() => c.setRemoving(null)} onConfirm={c.remove} />
        </div>
    );
}

function FacilityForm({ c, demo }) {
    const item = c.editing === "new" ? null : c.editing;
    const [v, setV] = useState({ title: item?.title ?? "", text: item?.text ?? "", image: item?.image ?? null, tone: item?.tone ?? "brand", isPublished: item?.isPublished ?? true });
    const fe = c.state.fieldErrors;
    const set = (k) => (e) => setV((s) => ({ ...s, [k]: e?.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e }));
    const submit = () =>
        c.save({ title: v.title, text: v.text, image: v.image && { path: v.image.path, alt: v.image.alt, width: v.image.width, height: v.image.height }, tone: v.tone, isPublished: v.isPublished });
    return (
        <Modal
            open
            onClose={c.close}
            title={item ? "Edit facility" : "Add facility"}
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
                <label className="block">
                    <span className={label}>Text *</span>
                    <textarea value={v.text} onChange={set("text")} rows={3} maxLength={400} className={`${field} ${fieldBorder(fe.text)}`} />
                    {fe.text && <span className={errorText}>{fe.text}</span>}
                </label>
                <ImageField value={v.image} onChange={set("image")} folder="facilities" label="Photo" required demo={demo} error={fe.image} />
                <fieldset>
                    <legend className={label}>Accent colour</legend>
                    <div className="mt-1 flex flex-wrap gap-2">
                        {TONES.map(([val, text]) => (
                            <label
                                key={val}
                                className={`cursor-pointer rounded-full border px-3 py-1.5 text-[13.5px] ${v.tone === val ? "border-brand bg-brand-soft text-brand-deep" : "border-line"}`}
                            >
                                <input type="radio" name="tone" value={val} checked={v.tone === val} onChange={set("tone")} className="sr-only" />
                                {text}
                            </label>
                        ))}
                    </div>
                </fieldset>
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
