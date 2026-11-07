"use client";

import { Check, Copy, KeyRound } from "lucide-react";
import { useState } from "react";

/** One-time password panel. Shown once: the API never returns it again. */
export default function TempPassword({ who, password }) {
    const [copied, setCopied] = useState(false);
    async function copy() {
        try {
            await navigator.clipboard.writeText(password);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            /* clipboard blocked: the password is selectable */
        }
    }
    return (
        <div className="rounded-2xl border border-dashed border-brand/50 bg-brand-soft/60 p-4">
            <p className="flex items-center gap-2 text-[13px] font-semibold tracking-wide text-brand-deep uppercase">
                <KeyRound className="size-4" aria-hidden="true" /> One-time password{who ? ` for ${who}` : ""}
            </p>
            <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 rounded-xl bg-white px-4 py-2.5 font-mono text-[18px] tracking-[0.12em] text-ink select-all">{password}</code>
                <button type="button" onClick={copy} className="btn-ghost min-h-11 text-[14px]">
                    {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                    {copied ? "Copied" : "Copy"}
                </button>
            </div>
            <p className="mt-2 text-[13px] text-ink-soft">Give it to the person directly. It will not be shown again, and they must choose a new password when they first sign in.</p>
        </div>
    );
}
