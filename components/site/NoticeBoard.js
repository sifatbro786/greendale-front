"use client";

import { FileDown, Pin } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const PAGE_SIZE = 10;

/**
 * Category filter + "load more" on the client. Phase 1 data is small; in Phase 2 the API
 * paginates (/api/public/notices?category=&page=) and this component keeps the same props.
 * @param {{ notices: (import("@/lib/data/types").Notice & { dateLabel: string })[], categories: {value:string,label:string}[] }} props
 */
export default function NoticeBoard({ notices, categories }) {
    const [cat, setCat] = useState("all");
    const [shown, setShown] = useState(PAGE_SIZE);

    const filtered = useMemo(() => (cat === "all" ? notices : notices.filter((n) => n.category === cat)), [cat, notices]);
    const visible = filtered.slice(0, shown);

    return (
        <div>
            <div role="tablist" aria-label="Filter notices by category" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
                {categories.map((c) => (
                    <button
                        key={c.value}
                        role="tab"
                        type="button"
                        aria-selected={cat === c.value}
                        onClick={() => {
                            setCat(c.value);
                            setShown(PAGE_SIZE);
                        }}
                        className={`shrink-0 rounded-full px-4 py-2 text-[14.5px] font-medium transition-colors ${
                            cat === c.value ? "bg-ink text-white" : "border border-line bg-white text-ink hover:border-brand"
                        }`}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            {visible.length ? (
                <ul className="mt-6 divide-y divide-line overflow-hidden rounded-[1.25rem] border border-line bg-white">
                    {visible.map((n) => (
                        <li key={n.id} className="relative">
                            <Link href={`/notices/${n.slug}`} className="grid gap-2 p-5 hover:bg-paper sm:grid-cols-[120px_1fr_auto] sm:items-center sm:gap-6 sm:p-6">
                                <time dateTime={n.publishedAt} className="text-[14px] font-medium text-ink-soft">{n.dateLabel}</time>
                                <span>
                                    <span className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[12.5px] font-medium text-brand-deep capitalize">{n.category}</span>
                                        {n.pinned && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-sun-soft px-2 py-0.5 text-[12.5px] font-medium text-[#8a6a00]">
                                                <Pin className="size-3" aria-hidden="true" /> Pinned
                                            </span>
                                        )}
                                    </span>
                                    <span className="mt-1.5 block text-[17px] font-semibold text-ink">{n.title}</span>
                                    {n.excerpt && <span className="mt-1 block text-[15px] text-ink-soft">{n.excerpt}</span>}
                                </span>
                                {n.pdfUrl && <FileDown className="hidden size-5 text-brand sm:block" aria-label="Has PDF attachment" />}
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-8 rounded-[1.25rem] border border-dashed border-line p-8 text-center text-ink-soft">No notices in this category yet.</p>
            )}

            {filtered.length > shown && (
                <div className="mt-6 text-center">
                    <button type="button" onClick={() => setShown((s) => s + PAGE_SIZE)} className="btn-ghost">
                        Show more notices
                    </button>
                </div>
            )}
        </div>
    );
}
