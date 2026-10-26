"use client";

import { useState } from "react";

/** Simple accessible tabs. Panels are server-rendered nodes passed in as props. */
export default function Tabs({ tabs, panels, initial }) {
    const [active, setActive] = useState(initial ?? tabs[0].id);
    return (
        <div>
            <div role="tablist" className="-mx-1 flex gap-1 overflow-x-auto border-b border-line px-1">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        role="tab"
                        id={`tab-${t.id}`}
                        aria-selected={active === t.id}
                        aria-controls={`panel-${t.id}`}
                        onClick={() => setActive(t.id)}
                        className={`relative shrink-0 px-4 py-3 text-[14.5px] font-medium transition-colors ${active === t.id ? "text-brand-deep" : "text-ink-soft hover:text-ink"}`}
                    >
                        {t.label}
                        {active === t.id && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand" />}
                    </button>
                ))}
            </div>
            {tabs.map((t) => (
                <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={active !== t.id} className="pt-5">
                    {panels[t.id]}
                </div>
            ))}
        </div>
    );
}
