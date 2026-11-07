"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/lib/api/client";

import { errorText, field, fieldBorder, hint, label } from "../admin/fields";
import Modal from "../Modal";
import { DEMO_SAVED, useToast } from "../Toast";

/**
 * New exam (POST /api/exams). Every active subject of the chosen classes is added with the default
 * full/pass marks; per-subject changes and the schedule are made on the setup page afterwards.
 * @param {{ classes: { id: string, name: string }[], demo?: boolean }} props
 */
export default function NewExamButton({ classes, demo = false }) {
    const router = useRouter();
    const toast = useToast();
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [fe, setFe] = useState({});
    const [v, setV] = useState({ name: "", shortName: "", startDate: "", endDate: "", fullMarks: 100, passMarks: 33, classIds: classes.map((c) => c.id) });
    const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
    const toggle = (id) => setV((s) => ({ ...s, classIds: s.classIds.includes(id) ? s.classIds.filter((x) => x !== id) : [...s.classIds, id] }));

    async function create(e) {
        e.preventDefault();
        if (demo) {
            setOpen(false);
            return toast(DEMO_SAVED, { title: "Exam would be created", tone: "info" });
        }
        if (!v.classIds.length) return setFe({ classIds: "Choose at least one class." });
        setBusy(true);
        setFe({});
        const body = {
            name: v.name,
            shortName: v.shortName || null,
            startDate: v.startDate || null,
            endDate: v.endDate || null,
            fullMarks: Number(v.fullMarks),
            passMarks: Number(v.passMarks),
            ...(v.classIds.length < classes.length && { classIds: v.classIds }),
        };
        const r = await api("/api/exams", { method: "POST", body });
        setBusy(false);
        if (!r.ok) {
            setFe(r.fieldErrors);
            return toast(Object.values(r.fieldErrors)[0] ?? r.error.message, { title: "Not created", tone: "error" });
        }
        toast("Set full marks and the exam schedule per subject, then open marks entry.", { title: `${r.data.name} created` });
        router.push(`/admin/exams/${r.data.id}`);
    }

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className="btn-primary min-h-10 text-[14px]">
                <Plus className="size-4" aria-hidden="true" /> New exam
            </button>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="New exam"
                footer={
                    <>
                        <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={() => setOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" form="new-exam" className="btn-primary min-h-10 text-[14px]" disabled={busy}>
                            {busy ? "Creating…" : "Create exam"}
                        </button>
                    </>
                }
            >
                <form id="new-exam" onSubmit={create} className="grid gap-4 sm:grid-cols-2">
                    <label className="sm:col-span-2">
                        <span className={label}>Exam name</span>
                        <input required value={v.name} onChange={set("name")} placeholder="Annual Examination" className={`${field} ${fieldBorder(fe.name)}`} />
                        {fe.name && <span className={errorText}>{fe.name}</span>}
                    </label>
                    <label>
                        <span className={label}>Short name</span>
                        <input value={v.shortName} onChange={set("shortName")} placeholder="Annual" className={`${field} ${fieldBorder(fe.shortName)}`} />
                        <span className={hint}>Used in SMS and cards.</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <label>
                            <span className={label}>Full marks</span>
                            <input type="number" min={1} max={500} value={v.fullMarks} onChange={set("fullMarks")} className={`${field} ${fieldBorder(fe.fullMarks)}`} />
                        </label>
                        <label>
                            <span className={label}>Pass marks</span>
                            <input type="number" min={0} max={500} value={v.passMarks} onChange={set("passMarks")} className={`${field} ${fieldBorder(fe.passMarks)}`} />
                        </label>
                        {fe.passMarks && <span className={`${errorText} col-span-2`}>{fe.passMarks}</span>}
                    </div>
                    <label>
                        <span className={label}>Starts</span>
                        <input type="date" value={v.startDate} onChange={set("startDate")} className={`${field} ${fieldBorder(fe.startDate)}`} />
                    </label>
                    <label>
                        <span className={label}>Ends</span>
                        <input type="date" value={v.endDate} min={v.startDate || undefined} onChange={set("endDate")} className={`${field} ${fieldBorder(fe.endDate)}`} />
                        {fe.endDate && <span className={errorText}>{fe.endDate}</span>}
                    </label>
                    <fieldset className="sm:col-span-2">
                        <legend className={label}>Classes</legend>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {classes.map((c) => {
                                const on = v.classIds.includes(c.id);
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        aria-pressed={on}
                                        onClick={() => toggle(c.id)}
                                        className={`min-h-9 rounded-full border px-3.5 text-[13.5px] font-medium transition-colors ${on ? "border-brand bg-brand-soft text-brand-deep" : "border-line bg-white text-ink-soft hover:border-ink/30"}`}
                                    >
                                        {c.name}
                                    </button>
                                );
                            })}
                        </div>
                        {fe.classIds && <span className={errorText}>{fe.classIds}</span>}
                    </fieldset>
                </form>
            </Modal>
        </>
    );
}
