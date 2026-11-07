"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";

/**
 * Error boundary body for /admin and /portal pages (the shell and menu stay usable).
 * In development the real message is shown: while Steps 3–4 are in progress, a live-mode page whose
 * module is not connected to the API yet lands here instead of showing demo data.
 */
export default function AreaError({ error, retry }) {
    useEffect(() => {
        console.error(error);
    }, [error]);
    const dev = process.env.NODE_ENV === "development";
    return (
        <div className="mx-auto max-w-lg rounded-2xl border border-line bg-white p-8 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-coral-soft text-coral">
                <TriangleAlert className="size-6" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-xl font-semibold text-ink">This page could not load</h1>
            <p className="mt-2 text-[15px] text-ink-soft">Please try again. If it keeps happening, contact the school office.</p>
            {dev && error?.message && <p className="mt-4 rounded-xl bg-paper px-4 py-3 text-left font-mono text-[12.5px] break-words text-ink">{error.message}</p>}
            <button type="button" onClick={() => retry()} className="btn-primary mt-6 min-h-11">
                <RotateCcw className="size-4" aria-hidden="true" />
                Try again
            </button>
        </div>
    );
}
