"use client";

import { Loader2, Save, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/lib/api/client";

import { DEMO_SAVED, useToast } from "../Toast";
import { errorText, field, fieldBorder, hint, label } from "./fields";
import TempPassword from "./TempPassword";

/**
 * Create or edit a staff account. POST /api/users · PATCH /api/users/:id
 * @param {{ mode: "create" | "edit", user?: any, roles: { id: string, label: string, role: string }[], staffOptions?: { id: string, name: string, designation: string, email?: string, phone?: string }[], demo?: boolean, isSelf?: boolean }} props
 */
export default function UserForm({ mode, user, roles, staffOptions = [], demo = false, isSelf = false }) {
    const router = useRouter();
    const toast = useToast();
    const [v, setV] = useState({
        name: user?.name ?? "",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
        roleId: user?.roleId ?? roles.find((r) => r.role === "TEACHER")?.id ?? roles[0]?.id ?? "",
        password: "",
        staffId: "",
    });
    const [state, setState] = useState({ busy: false, error: "", fieldErrors: {} });
    const [created, setCreated] = useState(null);
    const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
    const fe = state.fieldErrors;

    async function submit(e) {
        e.preventDefault();
        if (demo) return toast(DEMO_SAVED, { title: mode === "create" ? "User added" : "Saved", tone: "info" });
        setState({ busy: true, error: "", fieldErrors: {} });
        const body =
            mode === "create"
                ? { name: v.name, email: v.email, phone: v.phone, roleId: v.roleId, password: v.password, staffId: v.staffId || null }
                : { name: v.name, email: v.email, phone: v.phone, ...(!isSelf && { roleId: v.roleId }) };
        const r = await api(mode === "create" ? "/api/users" : `/api/users/${user.id}`, { method: mode === "create" ? "POST" : "PATCH", body });
        if (!r.ok) {
            const hasFields = Object.keys(r.fieldErrors).length > 0;
            setState({ busy: false, error: hasFields ? "Please check the highlighted fields." : r.error.message, fieldErrors: r.fieldErrors });
            return;
        }
        setState({ busy: false, error: "", fieldErrors: {} });
        if (mode === "create") {
            if (r.data.tempPassword) setCreated(r.data);
            else router.push(`/admin/users/${r.data.user.id}`);
        } else {
            // Show what the API stored (e.g. +880 1711-555666 → 01711555666).
            setV((s) => ({ ...s, name: r.data.name, email: r.data.email ?? "", phone: r.data.phone ?? "", roleId: r.data.roleId }));
            toast("Changes saved.", { title: "Saved" });
            router.refresh();
        }
    }

    if (created) {
        return (
            <div className="space-y-4">
                <TempPassword who={created.user.name} password={created.tempPassword} />
                <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/users/${created.user.id}`} className="btn-primary min-h-10 text-[14px]">
                        Open {created.user.name}
                    </Link>
                    <Link href="/admin/users" className="btn-ghost min-h-10 text-[14px]">
                        Back to users
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
            {mode === "create" && staffOptions.length > 0 && (
                <label className="sm:col-span-2">
                    <span className={label}>Staff record</span>
                    <select
                        value={v.staffId}
                        onChange={(e) => {
                            const st = staffOptions.find((x) => x.id === e.target.value);
                            setV((s) => ({ ...s, staffId: e.target.value, ...(st && { name: st.name, email: st.email ?? s.email, phone: st.phone ?? s.phone }) }));
                        }}
                        className={`${field} border-line`}
                    >
                        <option value="">Not a teacher / no staff record</option>
                        {staffOptions.map((st) => (
                            <option key={st.id} value={st.id}>
                                {st.name} · {st.designation}
                            </option>
                        ))}
                    </select>
                    <span className={hint}>Link a teacher&apos;s staff record so they see their own classes and subjects.</span>
                </label>
            )}
            <label className="sm:col-span-2">
                <span className={label}>Full name *</span>
                <input value={v.name} onChange={set("name")} autoComplete="off" className={`${field} ${fieldBorder(fe.name)}`} aria-invalid={!!fe.name} />
                {fe.name && <span className={errorText}>{fe.name}</span>}
            </label>
            <label>
                <span className={label}>Email</span>
                <input type="email" value={v.email} onChange={set("email")} autoComplete="off" inputMode="email" className={`${field} ${fieldBorder(fe.email)}`} aria-invalid={!!fe.email} />
                {fe.email ? <span className={errorText}>{fe.email}</span> : <span className={hint}>Email or mobile is needed to sign in.</span>}
            </label>
            <label>
                <span className={label}>Mobile</span>
                <input
                    type="tel"
                    value={v.phone}
                    onChange={set("phone")}
                    autoComplete="off"
                    inputMode="tel"
                    placeholder="01XXXXXXXXX"
                    className={`${field} ${fieldBorder(fe.phone)}`}
                    aria-invalid={!!fe.phone}
                />
                {fe.phone && <span className={errorText}>{fe.phone}</span>}
            </label>
            <label>
                <span className={label}>Role *</span>
                <select value={v.roleId} onChange={set("roleId")} disabled={isSelf} className={`${field} ${fieldBorder(fe.roleId)}`} aria-invalid={!!fe.roleId}>
                    {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                            {r.label}
                        </option>
                    ))}
                </select>
                {fe.roleId ? <span className={errorText}>{fe.roleId}</span> : isSelf ? <span className={hint}>You cannot change your own role.</span> : null}
            </label>
            {mode === "create" && (
                <label>
                    <span className={label}>Password</span>
                    <input type="text" value={v.password} onChange={set("password")} autoComplete="new-password" className={`${field} ${fieldBorder(fe.password)}`} aria-invalid={!!fe.password} />
                    {fe.password ? <span className={errorText}>{fe.password}</span> : <span className={hint}>Leave empty to generate a one-time password.</span>}
                </label>
            )}
            {state.error && (
                <p role="alert" className="rounded-xl bg-coral-soft px-4 py-3 text-[14.5px] text-ink sm:col-span-2">
                    {state.error}
                </p>
            )}
            <div className="sm:col-span-2">
                <button type="submit" disabled={state.busy} className="btn-primary min-h-11 text-[14.5px] disabled:opacity-60">
                    {state.busy ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : mode === "create" ? (
                        <UserPlus className="size-4" aria-hidden="true" />
                    ) : (
                        <Save className="size-4" aria-hidden="true" />
                    )}
                    {mode === "create" ? "Add user" : "Save changes"}
                </button>
            </div>
        </form>
    );
}
