"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/lib/api/client";

import { DEMO_SAVED, useToast } from "../Toast";
import { errorText, field, fieldBorder, hint, label } from "./fields";

/** POST /api/auth/password. Other devices are signed out; this one stays signed in. */
export default function ChangePasswordForm({ demo = false, forced = false, home = "/admin" }) {
    const router = useRouter();
    const toast = useToast();
    const [v, setV] = useState({ currentPassword: "", newPassword: "", confirm: "" });
    const [state, setState] = useState({ busy: false, error: "", fieldErrors: {} });
    const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
    const fe = state.fieldErrors;

    async function submit(e) {
        e.preventDefault();
        if (v.newPassword !== v.confirm) return setState({ busy: false, error: "", fieldErrors: { confirm: "The two new passwords do not match." } });
        if (demo) return toast(DEMO_SAVED, { title: "Password changed", tone: "info" });
        setState({ busy: true, error: "", fieldErrors: {} });
        const r = await api("/api/auth/password", { method: "POST", body: { currentPassword: v.currentPassword, newPassword: v.newPassword } });
        if (!r.ok) {
            const hasFields = Object.keys(r.fieldErrors).length > 0;
            setState({ busy: false, error: hasFields ? "Please check the highlighted fields." : r.error.message, fieldErrors: r.fieldErrors });
            return;
        }
        setV({ currentPassword: "", newPassword: "", confirm: "" });
        setState({ busy: false, error: "", fieldErrors: {} });
        toast("Other devices have been signed out.", { title: "Password changed" });
        if (forced) router.replace(home);
        router.refresh();
    }

    const input = (k, text, ac, extra) => (
        <label className="block">
            <span className={label}>{text}</span>
            <input type="password" value={v[k]} onChange={set(k)} autoComplete={ac} className={`${field} ${fieldBorder(fe[k])}`} aria-invalid={!!fe[k]} />
            {fe[k] ? <span className={errorText}>{fe[k]}</span> : extra ? <span className={hint}>{extra}</span> : null}
        </label>
    );

    return (
        <form onSubmit={submit} noValidate className="max-w-md space-y-4">
            {input("currentPassword", forced ? "One-time password from the office" : "Current password", "current-password")}
            {input("newPassword", "New password", "new-password", "At least 8 characters. A short sentence is easy to remember.")}
            {input("confirm", "New password again", "new-password")}
            {state.error && (
                <p role="alert" className="rounded-xl bg-coral-soft px-4 py-3 text-[14.5px] text-ink">
                    {state.error}
                </p>
            )}
            <button type="submit" disabled={state.busy} className="btn-primary min-h-11 text-[14.5px] disabled:opacity-60">
                {state.busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
                Change password
            </button>
        </form>
    );
}
