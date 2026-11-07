"use client";

import { Loader2, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/lib/api/client";

import { errorText, field, fieldBorder, hint, label } from "../admin/fields";
import ImageField from "../cms/ImageField";
import ConfirmDelete from "../cms/ConfirmDelete";
import { DEMO_SAVED, useToast } from "../Toast";

/** Teacher / office staff record. POST /api/staff · PATCH/DELETE /api/staff/:id */
export default function StaffForm({ member, demo = false }) {
    const router = useRouter();
    const toast = useToast();
    const isNew = !member;
    const [v, setV] = useState({
        name: member?.name ?? "",
        designation: member?.designation ?? "",
        qualification: member?.qualification ?? "",
        phone: member?.phone ?? "",
        email: member?.email ?? "",
        photo: member?.photo ?? null,
        group: member?.group ?? "TEACHER",
        showOnWebsite: member?.showOnWebsite ?? false,
        order: member?.order ?? 0,
        joinedAt: member?.joinedAt ?? "",
        isActive: member?.isActive ?? true,
    });
    const [state, setState] = useState({ busy: false, error: "", fieldErrors: {} });
    const [removing, setRemoving] = useState(false);
    const fe = state.fieldErrors;
    const set = (k) => (e) => setV((s) => ({ ...s, [k]: e?.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.type === "number" ? Number(e.target.value) : e.target.value) : e }));

    async function submit(e) {
        e.preventDefault();
        if (demo) return toast(DEMO_SAVED, { title: "Staff saved", tone: "info" });
        setState({ busy: true, error: "", fieldErrors: {} });
        const { photo, ...rest } = v;
        const body = { ...rest, photoPath: photo?.path ?? null, ...(isNew && { isActive: undefined }) };
        const r = await api(isNew ? "/api/staff" : `/api/staff/${member.id}`, { method: isNew ? "POST" : "PATCH", body });
        if (!r.ok) {
            const hasFields = Object.keys(r.fieldErrors).length > 0;
            return setState({ busy: false, error: hasFields ? "Please check the highlighted fields." : r.error.message, fieldErrors: r.fieldErrors });
        }
        setState({ busy: false, error: "", fieldErrors: {} });
        toast(v.isActive === false && member?.isActive ? "Their class and subject assignments for this session were cleared." : "Saved.", { title: "Staff saved" });
        if (isNew) router.replace(`/admin/staff/${r.data.id}`);
        router.refresh();
    }

    async function remove() {
        setRemoving(false);
        if (demo) return toast(DEMO_SAVED, { title: "Deleted", tone: "info" });
        const r = await api(`/api/staff/${member.id}`, { method: "DELETE" });
        if (!r.ok) return toast(r.error.message, { title: "Not deleted", tone: "error" });
        toast(`${member.name} was deleted.`, { title: "Deleted" });
        router.push("/admin/staff");
        router.refresh();
    }

    const text = (k, l, extra = {}) => (
        <label className={extra.wide ? "sm:col-span-2" : ""}>
            <span className={label}>
                {l}
                {extra.required && " *"}
            </span>
            <input
                type={extra.type ?? "text"}
                value={v[k]}
                onChange={set(k)}
                inputMode={extra.inputMode}
                placeholder={extra.placeholder}
                className={`${field} ${fieldBorder(fe[k])}`}
                aria-invalid={!!fe[k]}
            />
            {fe[k] ? <span className={errorText}>{fe[k]}</span> : extra.hint ? <span className={hint}>{extra.hint}</span> : null}
        </label>
    );

    return (
        <form onSubmit={submit} noValidate className="grid gap-5 lg:grid-cols-[1fr_300px]">
            <div className="grid content-start gap-4 sm:grid-cols-2">
                {text("name", "Full name", { required: true, wide: true })}
                {text("designation", "Designation", { required: true, placeholder: "e.g. Assistant Teacher" })}
                <label>
                    <span className={label}>Group</span>
                    <select value={v.group} onChange={set("group")} className={`${field} border-line`}>
                        <option value="TEACHER">Teacher</option>
                        <option value="OFFICE">Office staff</option>
                    </select>
                </label>
                {text("qualification", "Qualification", { placeholder: "e.g. B.Ed, M.A. in English", wide: true })}
                {text("phone", "Mobile", { type: "tel", inputMode: "tel", placeholder: "01XXXXXXXXX" })}
                {text("email", "Email", { type: "email", inputMode: "email" })}
                {text("joinedAt", "Joined", { type: "date" })}
                {text("order", "Order on the website", { type: "number", hint: "Smaller numbers come first." })}
                {!isNew && (
                    <div className="rounded-2xl border border-line p-4 sm:col-span-2">
                        <p className={label}>Login</p>
                        {member.login ? (
                            <p className="mt-1 text-[14px] text-ink-soft">
                                {member.login.identifier} · {member.login.role} · {member.login.status === "ACTIVE" ? "active" : "disabled"}.{" "}
                                <Link href={`/admin/users/${member.login.userId}`} className="font-semibold text-brand-deep">
                                    Manage login
                                </Link>
                            </p>
                        ) : (
                            <p className="mt-1 text-[14px] text-ink-soft">No login yet. Create one in Users &amp; roles (choose this person under “Staff record”).</p>
                        )}
                    </div>
                )}
            </div>
            <aside className="space-y-4">
                <ImageField value={v.photo} onChange={set("photo")} folder="staff" label="Photo" demo={demo} error={fe.photoPath} />
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-4">
                    <input type="checkbox" checked={v.showOnWebsite} onChange={set("showOnWebsite")} className="mt-1 size-4 accent-[var(--brand)]" />
                    <span>
                        <span className="block text-[14.5px] text-ink">Show on the website</span>
                        <span className="text-[12.5px] text-ink-soft">Name, designation, qualification and photo appear on the Teachers page. Phone and email never do.</span>
                    </span>
                </label>
                {!isNew && (
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-4">
                        <input type="checkbox" checked={v.isActive} onChange={set("isActive")} className="mt-1 size-4 accent-[var(--brand)]" />
                        <span>
                            <span className="block text-[14.5px] text-ink">Currently working here</span>
                            <span className="text-[12.5px] text-ink-soft">Untick when someone leaves. Their history stays; their classes for this session are cleared.</span>
                        </span>
                    </label>
                )}
                {state.error && (
                    <p role="alert" className="rounded-xl bg-coral-soft px-4 py-3 text-[14.5px] text-ink">
                        {state.error}
                    </p>
                )}
                <button type="submit" disabled={state.busy} className="btn-primary min-h-11 w-full text-[14.5px] disabled:opacity-60">
                    {state.busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
                    {isNew ? "Add staff" : "Save"}
                </button>
                {!isNew && !member.login && (
                    <button type="button" onClick={() => setRemoving(true)} className="flex items-center gap-2 text-[13.5px] font-medium text-ink-soft hover:text-coral">
                        <Trash2 className="size-4" aria-hidden="true" /> Delete record (only if added by mistake)
                    </button>
                )}
            </aside>
            {!isNew && (
                <ConfirmDelete
                    item={removing ? { title: member.name } : null}
                    onCancel={() => setRemoving(false)}
                    onConfirm={remove}
                    text="Only records with no classes, routine or login can be deleted. Otherwise untick “Currently working here”."
                />
            )}
        </form>
    );
}
