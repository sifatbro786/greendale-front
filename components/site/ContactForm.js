"use client";

import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";

const field =
    "mt-1.5 block w-full rounded-xl border bg-white px-4 py-3 text-[16px] text-ink placeholder:text-ink/35 focus:border-brand focus:ring-4 focus:ring-brand/15 focus:outline-none";

export default function ContactForm() {
    const [state, setState] = useState({ status: "idle", message: "", fieldErrors: {} });

    async function onSubmit(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        setState({ status: "sending", message: "", fieldErrors: {} });
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const out = await res.json().catch(() => ({}));
            if (res.ok && out.ok) {
                form.reset();
                setState({ status: "sent", message: "", fieldErrors: {} });
            } else {
                setState({ status: "error", message: out.message || "Something went wrong.", fieldErrors: out.fieldErrors || {} });
            }
        } catch {
            setState({ status: "error", message: "Network problem. Please try again or call the office.", fieldErrors: {} });
        }
    }

    if (state.status === "sent") {
        return (
            <div className="rounded-[1.5rem] bg-brand-soft p-8 text-center" role="status">
                <CheckCircle2 className="mx-auto size-12 text-brand" aria-hidden="true" />
                <p className="mt-4 text-xl font-semibold text-ink">Thank you! Your message has been sent.</p>
                <p className="mt-2 text-ink-soft">The office will get back to you soon.</p>
                <button type="button" className="btn-ghost mt-6" onClick={() => setState({ status: "idle", message: "", fieldErrors: {} })}>
                    Send another message
                </button>
            </div>
        );
    }

    const err = state.fieldErrors;
    const cls = (k) => `${field} ${err[k] ? "border-coral" : "border-line"}`;

    return (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                    <span className="text-[14.5px] font-medium text-ink">Your name *</span>
                    <input name="name" required autoComplete="name" className={cls("name")} aria-invalid={!!err.name} aria-describedby={err.name ? "e-name" : undefined} />
                    {err.name && <span id="e-name" className="mt-1 block text-sm text-coral">{err.name}</span>}
                </label>
                <label className="block">
                    <span className="text-[14.5px] font-medium text-ink">Mobile number *</span>
                    <input name="phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" className={cls("phone")} aria-invalid={!!err.phone} aria-describedby={err.phone ? "e-phone" : undefined} />
                    {err.phone && <span id="e-phone" className="mt-1 block text-sm text-coral">{err.phone}</span>}
                </label>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                    <span className="text-[14.5px] font-medium text-ink">Email (optional)</span>
                    <input name="email" type="email" autoComplete="email" className={cls("email")} aria-invalid={!!err.email} aria-describedby={err.email ? "e-email" : undefined} />
                    {err.email && <span id="e-email" className="mt-1 block text-sm text-coral">{err.email}</span>}
                </label>
                <label className="block">
                    <span className="text-[14.5px] font-medium text-ink">About</span>
                    <select name="subject" defaultValue="admission" className={cls("subject")}>
                        <option value="admission">Admission</option>
                        <option value="general">General question</option>
                        <option value="fees">Fees</option>
                        <option value="other">Other</option>
                    </select>
                </label>
            </div>
            <label className="block">
                <span className="text-[14.5px] font-medium text-ink">Message *</span>
                <textarea name="message" required rows={5} className={cls("message")} aria-invalid={!!err.message} aria-describedby={err.message ? "e-message" : undefined} />
                {err.message && <span id="e-message" className="mt-1 block text-sm text-coral">{err.message}</span>}
            </label>
            {/* Honeypot — hidden from people and screen readers */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>
                    Website
                    <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
            </div>

            {state.status === "error" && (
                <p role="alert" className="rounded-xl bg-coral-soft px-4 py-3 text-[15px] text-ink">
                    {state.message}
                </p>
            )}

            <button type="submit" disabled={state.status === "sending"} className="btn-primary w-full disabled:opacity-60 sm:w-auto">
                {state.status === "sending" ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
                {state.status === "sending" ? "Sending…" : "Send message"}
            </button>
        </form>
    );
}
