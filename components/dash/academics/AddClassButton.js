"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { field, fieldBorder, hint, label } from "../admin/fields";
import Modal from "../Modal";
import { useApiAction } from "./useApiAction";

/** Adds a class at the end of the ladder (e.g. Class VI when the school grows). */
export default function AddClassButton({ demo = false }) {
    const router = useRouter();
    const { busy, run } = useApiAction({ demo });
    const [open, setOpen] = useState(false);
    const [v, setV] = useState({ name: "", stage: "primary", gradingMode: "MARKS", sections: "A" });
    const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
    async function create() {
        const sections = v.sections
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);
        const r = await run("/api/academics/classes", "POST", { name: v.name, stage: v.stage, gradingMode: v.gradingMode, sections }, { success: `${v.name} added.` });
        if (r) {
            setOpen(false);
            router.push(`/admin/academics/${r.id}`);
        }
    }
    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className="btn-primary min-h-10 text-[14px]">
                <Plus className="size-4" aria-hidden="true" /> Add class
            </button>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Add class"
                size="sm"
                footer={
                    <>
                        <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={() => setOpen(false)}>
                            Cancel
                        </button>
                        <button type="button" className="btn-primary min-h-10 text-[14px]" onClick={create} disabled={busy || !v.name.trim()}>
                            Add class
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <label className="block">
                        <span className={label}>Class name *</span>
                        <input value={v.name} onChange={set("name")} placeholder="e.g. Class VI" className={`${field} ${fieldBorder(false)}`} />
                        <span className={hint}>It is added after the highest class; promotion moves students one class up.</span>
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label>
                            <span className={label}>Stage</span>
                            <select value={v.stage} onChange={set("stage")} className={`${field} border-line`}>
                                <option value="early">Early years</option>
                                <option value="primary">Primary</option>
                            </select>
                        </label>
                        <label>
                            <span className={label}>Results</span>
                            <select value={v.gradingMode} onChange={set("gradingMode")} className={`${field} border-line`}>
                                <option value="MARKS">Marks & GPA</option>
                                <option value="REMARKS">Remarks only</option>
                            </select>
                        </label>
                    </div>
                    <label className="block">
                        <span className={label}>Sections</span>
                        <input value={v.sections} onChange={set("sections")} className={`${field} border-line`} />
                        <span className={hint}>Comma separated, e.g. A, B</span>
                    </label>
                </div>
            </Modal>
        </>
    );
}
