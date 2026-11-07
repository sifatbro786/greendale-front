"use client";

import { Printer } from "lucide-react";

import TempPassword from "../admin/TempPassword";

/** Portal login slip after admission or reset (print and hand to the guardian). */
export default function PortalCredentials({ name, username, password }) {
    return (
        <div className="space-y-3">
            <TempPassword who={name} password={password} />
            <div className="rounded-xl border border-line px-4 py-3 text-[14.5px]">
                <p className="text-ink-soft">Portal login for the guardian</p>
                <p className="mt-1">
                    Student ID: <b className="font-mono tracking-wide">{username}</b>
                </p>
                <p>
                    Website: <b>{typeof window !== "undefined" ? `${window.location.origin}/login` : "/login"}</b>
                </p>
            </div>
            <button type="button" onClick={() => window.print()} className="btn-ghost min-h-10 text-[14px] print:hidden">
                <Printer className="size-4" aria-hidden="true" /> Print slip
            </button>
        </div>
    );
}
