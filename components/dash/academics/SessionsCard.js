"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { formatDate } from "@/lib/format";

import { errorText, field, fieldBorder, label } from "../admin/fields";
import Modal from "../Modal";
import { Badge, Card } from "../ui";
import { useApiAction } from "./useApiAction";

/** Academic sessions: list, add next year, switch the current one. */
export default function SessionsCard({ sessions, demo = false }) {
    const { busy, run } = useApiAction({ demo });
    const [open, setOpen] = useState(false);
    const [confirm, setConfirm] = useState(null);
    const lastYear = Number(sessions[0]?.name) || new Date().getFullYear();
    const [v, setV] = useState({ name: String(lastYear + 1), startDate: `${lastYear + 1}-01-01`, endDate: `${lastYear + 1}-12-31`, copyTeachers: true });
    const [fe, setFe] = useState({});
    const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

    async function create() {
        setFe({});
        const r = await run("/api/academics/sessions", "POST", v, { success: `Session ${v.name} created.` });
        if (r) setOpen(false);
    }

    return (
        <Card
            title="Academic sessions"
            padded={false}
            className="mb-4"
            actions={
                <button type="button" onClick={() => setOpen(true)} className="btn-ghost min-h-10 text-[14px]">
                    <Plus className="size-4" aria-hidden="true" /> New session
                </button>
            }
        >
            <ul className="divide-y divide-line">
                {sessions.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                        <span className="font-semibold text-ink">Session {s.name}</span>
                        <span className="text-[14px] text-ink-soft">
                            {formatDate(s.startDate)} – {formatDate(s.endDate)}
                        </span>
                        {s.isCurrent ? (
                            <Badge tone="green">Current</Badge>
                        ) : (
                            <button type="button" onClick={() => setConfirm(s)} className="ml-auto text-[13.5px] font-semibold text-brand-deep hover:text-brand">
                                Make current
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="New academic session"
                size="sm"
                footer={
                    <>
                        <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={() => setOpen(false)}>
                            Cancel
                        </button>
                        <button type="button" className="btn-primary min-h-10 text-[14px]" onClick={create} disabled={busy}>
                            Create
                        </button>
                    </>
                }
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="sm:col-span-2">
                        <span className={label}>Name</span>
                        <input value={v.name} onChange={set("name")} className={`${field} ${fieldBorder(fe.name)}`} />
                        {fe.name && <span className={errorText}>{fe.name}</span>}
                    </label>
                    <label>
                        <span className={label}>Starts</span>
                        <input type="date" value={v.startDate} onChange={set("startDate")} className={`${field} border-line`} />
                    </label>
                    <label>
                        <span className={label}>Ends</span>
                        <input type="date" value={v.endDate} onChange={set("endDate")} className={`${field} border-line`} />
                    </label>
                    <label className="flex items-start gap-3 sm:col-span-2">
                        <input type="checkbox" checked={v.copyTeachers} onChange={set("copyTeachers")} className="mt-1 size-4 accent-[var(--brand)]" />
                        <span className="text-[14px] text-ink">
                            Copy class teachers and subject teachers from the current session
                            <span className="block text-[12.5px] text-ink-soft">You can change them later. The new session does not become current until you switch it.</span>
                        </span>
                    </label>
                </div>
            </Modal>

            <Modal
                open={!!confirm}
                onClose={() => setConfirm(null)}
                title={confirm ? `Make ${confirm.name} the current session?` : ""}
                size="sm"
                footer={
                    <>
                        <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={() => setConfirm(null)}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn-primary min-h-10 text-[14px]"
                            disabled={busy}
                            onClick={async () => {
                                const s = confirm;
                                setConfirm(null);
                                await run(`/api/academics/sessions/${s.id}/current`, "POST", undefined, { success: `${s.name} is now the current session.` });
                            }}
                        >
                            Switch
                        </button>
                    </>
                }
            >
                <p className="text-[15px] text-ink-soft">Attendance, marks, fees and teacher assignments everywhere switch to this session. Do this after promotion at the start of the school year.</p>
            </Modal>
        </Card>
    );
}
