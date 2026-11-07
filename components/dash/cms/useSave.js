"use client";

import { useState } from "react";

import { api } from "@/lib/api/client";

/** Shared save state for the CMS editors: busy flag, top error, field errors from the API. */
export function useSave() {
    const [state, setState] = useState({ busy: false, error: "", fieldErrors: {} });
    async function save(path, method, body) {
        setState({ busy: true, error: "", fieldErrors: {} });
        const r = await api(path, { method, body });
        if (!r.ok) {
            const hasFields = Object.keys(r.fieldErrors).length > 0;
            setState({ busy: false, error: hasFields ? "Please check the highlighted fields." : r.error.message, fieldErrors: r.fieldErrors });
            return null;
        }
        setState({ busy: false, error: "", fieldErrors: {} });
        return r.data;
    }
    return { ...state, save };
}
