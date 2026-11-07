"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/lib/api/client";

import { DEMO_SAVED, useToast } from "../Toast";

/**
 * Small helper for immediate actions (save a row, delete, toggle): calls the API, toasts errors,
 * hands the response data to onData and refreshes server components.
 */
export function useApiAction({ demo = false } = {}) {
    const router = useRouter();
    const toast = useToast();
    const [busy, setBusy] = useState(false);
    async function run(path, method, body, { success, onData } = {}) {
        if (demo) {
            toast(DEMO_SAVED, { title: success ?? "Looks good!", tone: "info" });
            return null;
        }
        setBusy(true);
        const r = await api(path, { method, body });
        setBusy(false);
        if (!r.ok) {
            const first = Object.values(r.fieldErrors)[0];
            toast(first ?? r.error.message, { title: "Not saved", tone: "error" });
            return null;
        }
        onData?.(r.data);
        if (success) toast(success, { title: "Saved" });
        router.refresh();
        return r.data;
    }
    return { busy, run };
}
