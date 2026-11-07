"use client";

import { Loader2, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/lib/api/client";
import { PERMISSION_GROUPS } from "@/lib/auth/permissions";

import Modal from "../Modal";
import { DEMO_SAVED, useToast } from "../Toast";
import { errorText, field, fieldBorder, hint, label } from "./fields";

/**
 * Create or edit a role (a named permission set). POST /api/roles · PATCH/DELETE /api/roles/:id
 * Checkboxes for permissions the signed-in user does not hold are disabled (the API refuses them too).
 * @param {{ mode: "create" | "edit", role?: any, mine: string[], ownRole?: boolean, demo?: boolean }} props
 */
export default function RoleForm({ mode, role, mine, ownRole = false, demo = false }) {
    const router = useRouter();
    const toast = useToast();
    const [name, setName] = useState(role?.label ?? "");
    const [description, setDescription] = useState(role?.description ?? "");
    const [perms, setPerms] = useState(() => new Set(role?.permissions ?? ["dashboard.view"]));
    const [state, setState] = useState({ busy: false, error: "", fieldErrors: {} });
    const [confirmDelete, setConfirmDelete] = useState(false);
    const fe = state.fieldErrors;
    const nameLocked = mode === "edit" && role?.isSystem;
    const permsLocked = ownRole;

    const toggle = (p) =>
        setPerms((s) => {
            const n = new Set(s);
            n.has(p) ? n.delete(p) : n.add(p);
            return n;
        });

    async function submit(e) {
        e.preventDefault();
        if (demo) return toast(DEMO_SAVED, { title: "Role saved", tone: "info" });
        setState({ busy: true, error: "", fieldErrors: {} });
        const body = { ...(!nameLocked && { name }), description, ...(!permsLocked && { permissions: [...perms] }) };
        const r = await api(mode === "create" ? "/api/roles" : `/api/roles/${role.id}`, { method: mode === "create" ? "POST" : "PATCH", body });
        if (!r.ok) {
            const hasFields = Object.keys(r.fieldErrors).length > 0;
            setState({ busy: false, error: hasFields ? "Please check the highlighted fields." : r.error.message, fieldErrors: r.fieldErrors });
            return;
        }
        setState({ busy: false, error: "", fieldErrors: {} });
        toast("Permissions take effect on the next page each user opens.", { title: mode === "create" ? "Role created" : "Role saved" });
        router.push("/admin/users");
        router.refresh();
    }

    async function remove() {
        if (demo) return (setConfirmDelete(false), toast(DEMO_SAVED, { title: "Role deleted", tone: "info" }));
        const r = await api(`/api/roles/${role.id}`, { method: "DELETE" });
        setConfirmDelete(false);
        if (!r.ok) return toast(r.error.message, { title: "Not deleted", tone: "error" });
        toast(`${role.label} was deleted.`, { title: "Role deleted" });
        router.push("/admin/users");
        router.refresh();
    }

    return (
        <form onSubmit={submit} noValidate className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <label>
                    <span className={label}>Role name *</span>
                    <input value={name} onChange={(e) => setName(e.target.value)} disabled={nameLocked} className={`${field} ${fieldBorder(fe.name)}`} aria-invalid={!!fe.name} />
                    {fe.name ? <span className={errorText}>{fe.name}</span> : nameLocked ? <span className={hint}>Built-in roles keep their name.</span> : null}
                </label>
                <label>
                    <span className={label}>Description</span>
                    <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Front desk, admissions only" className={`${field} ${fieldBorder(fe.description)}`} />
                </label>
            </div>

            {permsLocked && <p className="rounded-xl bg-sun-soft px-4 py-3 text-[14px] text-ink">This is your own role, so its permissions can only be changed by a Super Admin.</p>}

            <div className="grid gap-4 md:grid-cols-2">
                {PERMISSION_GROUPS.map((g) => (
                    <fieldset key={g.module} className="rounded-2xl border border-line p-4">
                        <legend className="px-1 text-[12px] font-semibold tracking-wider text-brand-deep uppercase">{g.module}</legend>
                        <div className="space-y-1">
                            {g.perms.map(([p, text]) => {
                                const blocked = permsLocked || !mine.includes(p);
                                return (
                                    <label key={p} className={`flex items-start gap-3 rounded-xl px-2 py-2 ${blocked ? "opacity-55" : "cursor-pointer hover:bg-paper"}`}>
                                        <input type="checkbox" checked={perms.has(p)} onChange={() => toggle(p)} disabled={blocked} className="mt-0.5 size-4.5 shrink-0 accent-[var(--brand)]" />
                                        <span className="min-w-0">
                                            <span className="block text-[14.5px] text-ink">{text}</span>
                                            <code className="text-[11.5px] text-ink-soft">{p}</code>
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </fieldset>
                ))}
            </div>

            {(state.error || fe.permissions) && (
                <p role="alert" className="rounded-xl bg-coral-soft px-4 py-3 text-[14.5px] text-ink">
                    {fe.permissions || state.error}
                </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
                <button type="submit" disabled={state.busy} className="btn-primary min-h-11 text-[14.5px] disabled:opacity-60">
                    {state.busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
                    {mode === "create" ? "Create role" : "Save role"}
                </button>
                {mode === "edit" && !role.isSystem && (
                    <button type="button" onClick={() => setConfirmDelete(true)} className="btn-ghost min-h-11 text-[14.5px] hover:text-coral">
                        <Trash2 className="size-4" aria-hidden="true" /> Delete role
                    </button>
                )}
            </div>

            {mode === "edit" && (
                <Modal
                    open={confirmDelete}
                    onClose={() => setConfirmDelete(false)}
                    title={`Delete ${role.label}?`}
                    size="sm"
                    footer={
                        <>
                            <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={() => setConfirmDelete(false)}>
                                Cancel
                            </button>
                            <button type="button" className="btn-primary min-h-10 bg-coral! text-[14px]" onClick={remove}>
                                Delete
                            </button>
                        </>
                    }
                >
                    <p className="text-[15px] text-ink-soft">{role.userCount > 0 ? `${role.userCount} user(s) still have this role. Move them to another role first.` : "Nobody has this role. It will be removed."}</p>
                </Modal>
            )}
        </form>
    );
}
