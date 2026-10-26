"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

/** Switch between preloaded month panels (portal attendance). */
export default function MonthSwitcher({ months, panels }) {
    const [i, setI] = useState(months.length - 1);
    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <button type="button" onClick={() => setI((x) => x - 1)} disabled={i === 0} className="grid size-10 place-items-center rounded-xl border border-line bg-white disabled:opacity-40" aria-label="Previous month">
                    <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
                <p className="text-lg font-semibold text-ink">{months[i].label}</p>
                <button type="button" onClick={() => setI((x) => x + 1)} disabled={i === months.length - 1} className="grid size-10 place-items-center rounded-xl border border-line bg-white disabled:opacity-40" aria-label="Next month">
                    <ChevronRight className="size-5" aria-hidden="true" />
                </button>
            </div>
            {panels[months[i].value]}
        </div>
    );
}
