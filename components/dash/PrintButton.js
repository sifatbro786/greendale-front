"use client";

import { Printer } from "lucide-react";

export default function PrintButton({ label = "Print", className = "btn-primary min-h-10 text-[14px]" }) {
    return (
        <button type="button" onClick={() => window.print()} className={className}>
            <Printer className="size-4" aria-hidden="true" /> {label}
        </button>
    );
}
