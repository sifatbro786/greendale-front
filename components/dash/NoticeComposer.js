"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import Modal from "./Modal";
import { DEMO_SAVED, useToast } from "./Toast";

const field = "mt-1 block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10";

/** Notice composer. Phase 2: POST /api/notices (publishedAt in the future = scheduled; HTML sanitised server-side). */
export default function NoticeComposer({ audiences }) {
    const [open, setOpen] = useState(false);
    const toast = useToast();
    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className="btn-primary min-h-10 text-[14px]">
                <Plus className="size-4" aria-hidden="true" /> New notice
            </button>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="New notice"
                size="lg"
                footer={
                    <>
                        <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={() => setOpen(false)}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn-primary min-h-10 text-[14px]"
                            onClick={() => {
                                setOpen(false);
                                toast(DEMO_SAVED, { title: "Notice published", tone: "info" });
                            }}
                        >
                            Publish
                        </button>
                    </>
                }
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="sm:col-span-2">
                        <span className="text-[14px] font-medium">Title *</span>
                        <input className={field} placeholder="e.g. Annual exam routine published" />
                    </label>
                    <label>
                        <span className="text-[14px] font-medium">Audience</span>
                        <select className={field}>
                            {audiences.map((a) => (
                                <option key={a.value} value={a.value}>
                                    {a.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <span className="text-[14px] font-medium">Publish at</span>
                        <input type="datetime-local" className={field} />
                        <span className="mt-1 block text-[12.5px] text-ink-soft">A future time schedules the notice.</span>
                    </label>
                    <label className="sm:col-span-2">
                        <span className="text-[14px] font-medium">Message</span>
                        <textarea rows={5} className={field} />
                    </label>
                    <label>
                        <span className="text-[14px] font-medium">PDF attachment</span>
                        <input type="file" accept="application/pdf" className={`${field} py-2`} />
                    </label>
                    <div className="flex flex-col justify-end gap-2 text-[14px]">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="size-4 accent-[var(--brand)]" /> Pin to top
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="size-4 accent-[var(--brand)]" /> Also show on the website
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="size-4 accent-[var(--brand)]" /> Send as SMS
                        </label>
                    </div>
                </div>
            </Modal>
        </>
    );
}
