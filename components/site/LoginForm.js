"use client";

import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { useEffect, useState } from "react";

const DEMO = [
    { label: "Principal / Admin", identifier: "admin@greendale.demo", password: "12345678" },
    { label: "Teacher", identifier: "teacher@greendale.demo", password: "12345678" },
    { label: "Student / Guardian", identifier: "GEVS-26109", password: "12345678" },
];

/** One login for staff and guardians; the API decides where each role lands. */
export default function LoginForm() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [state, setState] = useState({ busy: false, error: "", fieldErrors: {} });

    // Coming back to this page (browser Back, bfcache) must never show a stuck "Signing in…".
    useEffect(() => {
        const reset = () => setState({ busy: false, error: "", fieldErrors: {} });
        window.addEventListener("pageshow", reset);
        return () => window.removeEventListener("pageshow", reset);
    }, []);

    async function submit(e) {
        e.preventDefault();
        setState({ busy: true, error: "", fieldErrors: {} });
        const next = new URLSearchParams(window.location.search).get("next") ?? undefined;
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier, password, next }),
            });
            const out = await res.json().catch(() => ({}));
            if (!res.ok || !out.ok) {
                setState({ busy: false, error: out.message || "Could not sign in.", fieldErrors: out.fieldErrors || {} });
                return;
            }
            // Full navigation so the new httpOnly session cookie is used for the very first dashboard request.
            window.location.assign(out.redirectTo);
        } catch {
            setState({ busy: false, error: "Network problem. Please try again.", fieldErrors: {} });
        }
    }

    const input = "mt-1.5 block w-full rounded-xl border bg-white px-4 py-3 text-[16px] text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/15";

    return (
        <div>
            <form onSubmit={submit} noValidate className="space-y-5">
                <label className="block">
                    <span className="text-[14.5px] font-medium text-ink">Email or Student ID</span>
                    <input
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        autoComplete="username"
                        placeholder="you@school.edu or GEVS-26xxx"
                        className={`${input} ${state.fieldErrors.identifier ? "border-coral" : "border-line"}`}
                        aria-invalid={!!state.fieldErrors.identifier}
                    />
                    {state.fieldErrors.identifier && <span className="mt-1 block text-sm text-coral">{state.fieldErrors.identifier}</span>}
                </label>
                <label className="block">
                    <span className="text-[14.5px] font-medium text-ink">Password</span>
                    <span className="relative block">
                        <input
                            type={show ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            className={`${input} pr-12 ${state.fieldErrors.password ? "border-coral" : "border-line"}`}
                            aria-invalid={!!state.fieldErrors.password}
                        />
                        <button type="button" onClick={() => setShow((s) => !s)} className="absolute top-1/2 right-2 mt-0.5 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-ink-soft hover:bg-paper" aria-label={show ? "Hide password" : "Show password"}>
                            {show ? <EyeOff className="size-4.5" aria-hidden="true" /> : <Eye className="size-4.5" aria-hidden="true" />}
                        </button>
                    </span>
                    {state.fieldErrors.password && <span className="mt-1 block text-sm text-coral">{state.fieldErrors.password}</span>}
                </label>
                {state.error && (
                    <p role="alert" className="rounded-xl bg-coral-soft px-4 py-3 text-[14.5px] text-ink">
                        {state.error}
                    </p>
                )}
                <button type="submit" disabled={state.busy} className="btn-primary w-full disabled:opacity-60">
                    {state.busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <LogIn className="size-4" aria-hidden="true" />}
                    {state.busy ? "Signing in…" : "Sign in"}
                </button>
                <p className="text-center text-[13.5px] text-ink-soft">Forgot your password? The school office can reset it for you.</p>
            </form>

            <div className="mt-8 rounded-2xl border border-dashed border-brand/40 bg-brand-soft/50 p-4">
                <p className="text-[13px] font-semibold tracking-wide text-brand-deep uppercase">Demo accounts</p>
                <ul className="mt-2.5 space-y-2">
                    {DEMO.map((d) => (
                        <li key={d.label} className="flex items-center justify-between gap-3 text-[13.5px]">
                            <span>
                                <span className="block font-medium text-ink">{d.label}</span>
                                <span className="text-ink-soft">
                                    {d.identifier} · {d.password}
                                </span>
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setIdentifier(d.identifier);
                                    setPassword(d.password);
                                }}
                                className="shrink-0 rounded-full border border-brand/40 bg-white px-3 py-1.5 text-[13px] font-semibold text-brand-deep hover:bg-brand hover:text-white"
                            >
                                Use
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
