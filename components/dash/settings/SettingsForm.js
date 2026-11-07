"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/lib/api/client";

import { errorText, field, fieldBorder, hint, label } from "../admin/fields";
import { DEMO_SAVED, useToast } from "../Toast";
import { Card } from "../ui";

const MODULES = [
    ["cms", "Website CMS"],
    ["students", "Students & classes"],
    ["results", "Exams & results"],
    ["attendance", "Attendance"],
    ["routine", "Routine"],
    ["cards", "Admit & ID cards"],
    ["fees", "Fees & payments"],
    ["sms", "SMS"],
    ["portal", "Student portal"],
];
const DAYS = [
    ["SAT", "Sat"],
    ["SUN", "Sun"],
    ["MON", "Mon"],
    ["TUE", "Tue"],
    ["WED", "Wed"],
    ["THU", "Thu"],
    ["FRI", "Fri"],
];

/**
 * School settings (PATCH /api/settings with only the keys that changed). These values, not code,
 * make the platform fit another school. Logo and colours are build-time (config/school.js).
 */
export default function SettingsForm({ initial, brand, demo = false }) {
    const router = useRouter();
    const toast = useToast();
    const [v, setV] = useState(initial);
    const [busy, setBusy] = useState(false);
    const [fe, setFe] = useState({});
    const p = v["school.profile"];
    const setKey = (k, val) => setV((s) => ({ ...s, [k]: val }));
    const setProfile = (path, val) =>
        setV((s) => {
            const next = structuredClone(s["school.profile"]);
            const parts = path.split(".");
            let o = next;
            for (const k of parts.slice(0, -1)) o = o[k] ??= {};
            o[parts.at(-1)] = val;
            return { ...s, "school.profile": next };
        });
    const changed = Object.keys(v).filter((k) => JSON.stringify(v[k]) !== JSON.stringify(initial[k]));
    const err = (k) => fe[k] && <span className={errorText}>{fe[k]}</span>;

    async function save() {
        if (demo) return toast(DEMO_SAVED, { title: "Settings would be saved", tone: "info" });
        setBusy(true);
        setFe({});
        const body = Object.fromEntries(changed.map((k) => [k, v[k]]));
        const r = await api("/api/settings", { method: "PATCH", body });
        setBusy(false);
        if (!r.ok) {
            // zod paths look like "school.profile.contact.email" or "cards.admitDueLimit": map to the setting key
            const byKey = {};
            for (const d of r.error.details ?? []) {
                const k = Object.keys(initial).find((x) => String(d.path).startsWith(x));
                if (k && !byKey[k]) byKey[k] = d.message;
            }
            setFe(byKey);
            return toast(Object.values(byKey)[0] ?? r.error.message, { title: "Not saved", tone: "error" });
        }
        toast("Other screens pick up the change within 30 seconds.", { title: "Settings saved" });
        router.refresh();
    }

    const number = (val) => (val === "" ? null : Number(val));

    return (
        <>
            <div className="grid gap-4 pb-24 xl:grid-cols-2 xl:pb-0">
                <Card title="School" description="Used in SMS, receipts, the payment page and emails.">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="sm:col-span-2">
                            <span className={label}>School name</span>
                            <input value={p.name ?? ""} onChange={(e) => setProfile("name", e.target.value)} className={`${field} ${fieldBorder(fe["school.profile"])}`} />
                        </label>
                        <label>
                            <span className={label}>Short name</span>
                            <input value={p.shortName ?? ""} onChange={(e) => setProfile("shortName", e.target.value)} className={`${field} ${fieldBorder(false)}`} />
                            <span className={hint}>Signs every SMS.</span>
                        </label>
                        <label>
                            <span className={label}>EIIN</span>
                            <input value={p.eiin ?? ""} onChange={(e) => setProfile("eiin", e.target.value)} className={`${field} ${fieldBorder(false)}`} />
                        </label>
                        <label>
                            <span className={label}>Phone</span>
                            <input value={p.contact?.phone ?? ""} onChange={(e) => setProfile("contact.phone", e.target.value)} className={`${field} ${fieldBorder(false)}`} />
                        </label>
                        <label>
                            <span className={label}>WhatsApp</span>
                            <input value={p.contact?.whatsapp ?? ""} onChange={(e) => setProfile("contact.whatsapp", e.target.value)} className={`${field} ${fieldBorder(false)}`} />
                        </label>
                        <label className="sm:col-span-2">
                            <span className={label}>Email</span>
                            <input type="email" value={p.contact?.email ?? ""} onChange={(e) => setProfile("contact.email", e.target.value)} className={`${field} ${fieldBorder(false)}`} />
                        </label>
                        <label className="sm:col-span-2">
                            <span className={label}>Address (one line per row)</span>
                            <textarea rows={2} value={(p.contact?.addressLines ?? []).join("\n")} onChange={(e) => setProfile("contact.addressLines", e.target.value.split("\n").slice(0, 4))} className={`${field} ${fieldBorder(false)}`} />
                        </label>
                        <label className="sm:col-span-2">
                            <span className={label}>Short address</span>
                            <input value={p.contact?.addressShort ?? ""} onChange={(e) => setProfile("contact.addressShort", e.target.value)} className={`${field} ${fieldBorder(false)}`} />
                            <span className={hint}>Printed on receipts, marksheets and cards.</span>
                        </label>
                        <label>
                            <span className={label}>Facebook</span>
                            <input value={p.social?.facebook ?? ""} onChange={(e) => setProfile("social.facebook", e.target.value)} className={`${field} ${fieldBorder(false)}`} />
                        </label>
                        <label>
                            <span className={label}>YouTube</span>
                            <input value={p.social?.youtube ?? ""} onChange={(e) => setProfile("social.youtube", e.target.value)} className={`${field} ${fieldBorder(false)}`} />
                        </label>
                        <div className="sm:col-span-2">{err("school.profile")}</div>
                        <div className="flex items-center gap-3 rounded-xl bg-paper/70 px-3.5 py-3 text-[13.5px] text-ink-soft sm:col-span-2">
                            <span className="size-6 shrink-0 rounded-md border border-line" style={{ background: brand }} aria-hidden="true" />
                            Logo, colours and the public website text are set per school when the site is deployed.
                        </div>
                    </div>
                </Card>

                <div className="grid content-start gap-4">
                    <Card title="Attendance & SMS">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label>
                                <span className={label}>Absent SMS time</span>
                                <input type="time" value={v["attendance.smsCutoff"]} onChange={(e) => setKey("attendance.smsCutoff", e.target.value)} className={`${field} ${fieldBorder(fe["attendance.smsCutoff"])}`} />
                                <span className={hint}>One SMS per absent student, sent at this time.</span>
                                {err("attendance.smsCutoff")}
                            </label>
                            <fieldset>
                                <legend className={label}>Weekly holidays</legend>
                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                    {DAYS.map(([d, l]) => {
                                        const on = v["attendance.weeklyOff"].includes(d);
                                        return (
                                            <button key={d} type="button" aria-pressed={on} onClick={() => setKey("attendance.weeklyOff", on ? v["attendance.weeklyOff"].filter((x) => x !== d) : [...v["attendance.weeklyOff"], d])} className={`min-h-9 rounded-full border px-3 text-[13.5px] font-medium ${on ? "border-brand bg-brand-soft text-brand-deep" : "border-line bg-white text-ink-soft"}`}>
                                                {l}
                                            </button>
                                        );
                                    })}
                                </div>
                                {err("attendance.weeklyOff")}
                            </fieldset>
                        </div>
                    </Card>

                    <Card title="Exams, cards & fees">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label>
                                <span className={label}>Position tie-break</span>
                                <select value={v["results.tieBreak"]} onChange={(e) => setKey("results.tieBreak", e.target.value)} className={`${field} ${fieldBorder(false)}`}>
                                    <option value="roll">Total, then roll</option>
                                    <option value="name">Total, then name</option>
                                </select>
                                <span className={hint}>Applies to results published from now on.</span>
                            </label>
                            <label>
                                <span className={label}>Hold admit card if dues above (৳)</span>
                                <input type="number" inputMode="numeric" min={0} placeholder="Never hold" value={v["cards.admitDueLimit"] ?? ""} onChange={(e) => setKey("cards.admitDueLimit", number(e.target.value))} className={`${field} ${fieldBorder(fe["cards.admitDueLimit"])}`} />
                                {err("cards.admitDueLimit")}
                            </label>
                            <label>
                                <span className={label}>Monthly invoices</span>
                                <select value={v["fees.autoInvoiceDay"] ?? ""} onChange={(e) => setKey("fees.autoInvoiceDay", number(e.target.value))} className={`${field} ${fieldBorder(false)}`}>
                                    <option value="">Manual (Fees → Generate)</option>
                                    {Array.from({ length: 28 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            Automatic on day {i + 1} of the month
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                <span className={label}>Receipt prefix</span>
                                <input value={v["fees.receiptPrefix"] ?? ""} onChange={(e) => setKey("fees.receiptPrefix", e.target.value.toUpperCase())} className={`${field} ${fieldBorder(fe["fees.receiptPrefix"])}`} />
                                <span className={hint}>{`${v["fees.receiptPrefix"] || "…"}-${new Date().getFullYear()}-00042`}</span>
                                {err("fees.receiptPrefix")}
                            </label>
                            <label className="sm:col-span-2">
                                <span className={label}>Student ID prefix</span>
                                <input value={v["ids.studentUidPrefix"] ?? ""} onChange={(e) => setKey("ids.studentUidPrefix", e.target.value.toUpperCase())} className={`${field} ${fieldBorder(fe["ids.studentUidPrefix"])}`} />
                                <span className={hint}>New students only ({`${v["ids.studentUidPrefix"] || "…"}26001`}). Existing IDs and portal usernames never change.</span>
                                {err("ids.studentUidPrefix")}
                            </label>
                        </div>
                    </Card>

                    <Card title="Modules" description="Turned off: the menu item disappears and the API refuses it. Data is kept.">
                        <ul className="grid gap-2 sm:grid-cols-2">
                            {MODULES.map(([m, l]) => {
                                const on = v["modules.enabled"].includes(m);
                                return (
                                    <li key={m}>
                                        <label className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[14.5px] ${m === "students" ? "border-line bg-paper/60 text-ink-soft" : "border-line"}`}>
                                            <input type="checkbox" checked={on} disabled={m === "students"} onChange={() => setKey("modules.enabled", on ? v["modules.enabled"].filter((x) => x !== m) : [...v["modules.enabled"], m])} className="size-4 accent-[var(--brand)]" />
                                            {l}
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                        {err("modules.enabled")}
                    </Card>
                </div>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur xl:static xl:mt-4 xl:border-0 xl:bg-transparent xl:p-0">
                <div className="flex items-center justify-end gap-3">
                    <span className="text-[14px] text-ink-soft">{changed.length ? `${changed.length} section${changed.length > 1 ? "s" : ""} changed` : "No changes"}</span>
                    <button type="button" className="btn-ghost min-h-10 text-[14px]" disabled={!changed.length || busy} onClick={() => (setV(initial), setFe({}))}>
                        Discard
                    </button>
                    <button type="button" className="btn-primary min-h-10 text-[14px]" disabled={!changed.length || busy} onClick={save}>
                        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />} Save changes
                    </button>
                </div>
            </div>
        </>
    );
}
