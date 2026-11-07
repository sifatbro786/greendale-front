"use client";

import { Check, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/lib/api/client";

import { DEMO_SAVED, useToast } from "../Toast";

/** Contact-form message: mark replied (or undo). PATCH /api/cms/messages/:id */
export default function MessageActions({ id, replied, demo = false }) {
    const router = useRouter();
    const toast = useToast();
    const [busy, setBusy] = useState(false);
    async function mark(value) {
        if (demo) return toast(DEMO_SAVED, { title: "Marked as replied", tone: "info" });
        setBusy(true);
        const r = await api(`/api/cms/messages/${id}`, { method: "PATCH", body: { replied: value } });
        setBusy(false);
        if (!r.ok) return toast(r.error.message, { title: "Not saved", tone: "error" });
        router.refresh();
    }
    return replied ? (
        <button type="button" onClick={() => mark(false)} disabled={busy} className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-soft hover:text-ink">
            <Undo2 className="size-3.5" aria-hidden="true" /> Mark as not replied
        </button>
    ) : (
        <button type="button" onClick={() => mark(true)} disabled={busy} className="mt-2 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand-deep hover:text-brand">
            <Check className="size-4" aria-hidden="true" /> Mark as replied
        </button>
    );
}
