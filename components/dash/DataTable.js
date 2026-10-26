"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

/**
 * Generic data table with search, filters, sort, pagination and CSV export.
 * Column config is plain data (no functions) so Server Components can pass it.
 *
 * @typedef {{ key: string, label: string, type?: "text"|"number"|"money"|"date"|"datetime"|"badge"|"person", sub?: string, href?: string, align?: "left"|"right"|"center", hideOnMobile?: boolean, sortable?: boolean, badgeTones?: Record<string, string> }} Column
 * @param {{ rows: object[], columns: Column[], searchKeys?: string[], searchPlaceholder?: string, filters?: { key: string, label: string, options: {value: string, label: string}[] }[], pageSize?: number, exportName?: string, rowHref?: string, emptyTitle?: string, initialSort?: { key: string, dir: "asc"|"desc" } }} props
 */
export default function DataTable({ rows, columns, searchKeys = [], searchPlaceholder = "Search…", filters = [], pageSize = 15, exportName, rowHref, emptyTitle = "Nothing found", initialSort }) {
    const [q, setQ] = useState("");
    const [f, setF] = useState({});
    const [sort, setSort] = useState(initialSort ?? null);
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        let out = rows.filter((r) => Object.entries(f).every(([k, v]) => !v || String(r[k]) === v));
        if (needle) out = out.filter((r) => searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(needle)));
        if (sort) {
            out = [...out].sort((a, b) => {
                const x = a[sort.key],
                    y = b[sort.key];
                const c = typeof x === "number" && typeof y === "number" ? x - y : String(x ?? "").localeCompare(String(y ?? ""), "en", { numeric: true });
                return sort.dir === "asc" ? c : -c;
            });
        }
        return out;
    }, [rows, q, f, sort, searchKeys]);

    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const cur = Math.min(page, pages);
    const view = filtered.slice((cur - 1) * pageSize, cur * pageSize);

    function toggleSort(key) {
        setSort((s) => (s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null));
    }

    function exportCsv() {
        const head = columns.map((c) => c.label);
        const lines = filtered.map((r) => columns.map((c) => `"${String(r[c.key] ?? "").replace(/"/g, '""')}"`).join(","));
        const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${exportName}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    const fill = (tpl, r) => tpl.replace(/\{(\w+)\}/g, (_, k) => encodeURIComponent(r[k]));

    return (
        <div>
            {(searchKeys.length > 0 || filters.length > 0 || exportName) && (
                <div className="flex flex-col gap-2 border-b border-line p-4 sm:flex-row sm:flex-wrap sm:items-center">
                    {searchKeys.length > 0 && (
                        <label className="relative flex-1 sm:max-w-xs">
                            <span className="sr-only">Search</span>
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
                            <input
                                value={q}
                                onChange={(e) => {
                                    setQ(e.target.value);
                                    setPage(1);
                                }}
                                placeholder={searchPlaceholder}
                                className="h-10 w-full rounded-xl border border-line bg-white pr-3 pl-9 text-[14.5px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
                            />
                        </label>
                    )}
                    {filters.map((fl) => (
                        <label key={fl.key} className="sm:w-48">
                            <span className="sr-only">{fl.label}</span>
                            <select
                                value={f[fl.key] ?? ""}
                                onChange={(e) => {
                                    setF((s) => ({ ...s, [fl.key]: e.target.value }));
                                    setPage(1);
                                }}
                                className="h-10 w-full rounded-xl border border-line bg-white px-3 text-[14.5px] outline-none focus:border-brand"
                            >
                                <option value="">{fl.label}: All</option>
                                {fl.options.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    ))}
                    {exportName && (
                        <button type="button" onClick={exportCsv} className="btn-ghost min-h-10 px-4 text-[14px] sm:ml-auto">
                            <Download className="size-4" aria-hidden="true" /> Export CSV
                        </button>
                    )}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left text-[14px]">
                    <thead>
                        <tr className="border-b border-line bg-paper/60">
                            {columns.map((c) => {
                                const active = sort?.key === c.key;
                                const align = c.align === "right" || c.type === "money" || c.type === "number" ? "text-right" : c.align === "center" ? "text-center" : "text-left";
                                return (
                                    <th key={c.key} scope="col" className={`px-4 py-3 text-[12.5px] font-semibold tracking-wide whitespace-nowrap text-ink-soft uppercase ${align} ${c.hideOnMobile ? "hidden md:table-cell" : ""}`} aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}>
                                        {c.sortable === false ? (
                                            c.label
                                        ) : (
                                            <button type="button" onClick={() => toggleSort(c.key)} className={`inline-flex items-center gap-1 hover:text-ink ${align === "text-right" ? "flex-row-reverse" : ""}`}>
                                                {c.label}
                                                {active ? sort.dir === "asc" ? <ArrowUp className="size-3.5" aria-hidden="true" /> : <ArrowDown className="size-3.5" aria-hidden="true" /> : <ArrowUpDown className="size-3.5 opacity-40" aria-hidden="true" />}
                                            </button>
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {view.map((r, i) => (
                            <tr key={r.id ?? i} className="border-b border-line last:border-0 hover:bg-paper/50">
                                {columns.map((c, ci) => (
                                    <td key={c.key} className={`px-4 py-3 align-middle ${c.type === "money" || c.type === "number" || c.align === "right" ? "text-right tabular-nums" : c.align === "center" ? "text-center" : ""} ${c.hideOnMobile ? "hidden md:table-cell" : ""}`}>
                                        <Cell col={c} row={r} href={c.href ? fill(c.href, r) : ci === 0 && rowHref ? fill(rowHref, r) : null} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {view.length === 0 && <p className="px-4 py-12 text-center text-[14.5px] text-ink-soft">{emptyTitle}</p>}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-[13.5px] text-ink-soft">
                <p>
                    {filtered.length === 0 ? 0 : (cur - 1) * pageSize + 1}–{Math.min(cur * pageSize, filtered.length)} of {filtered.length}
                </p>
                {pages > 1 && (
                    <div className="flex items-center gap-1">
                        <button type="button" onClick={() => setPage(cur - 1)} disabled={cur === 1} className="grid size-9 place-items-center rounded-lg border border-line bg-white disabled:opacity-40" aria-label="Previous page">
                            <ChevronLeft className="size-4" aria-hidden="true" />
                        </button>
                        <span className="px-2 tabular-nums">
                            {cur} / {pages}
                        </span>
                        <button type="button" onClick={() => setPage(cur + 1)} disabled={cur === pages} className="grid size-9 place-items-center rounded-lg border border-line bg-white disabled:opacity-40" aria-label="Next page">
                            <ChevronRight className="size-4" aria-hidden="true" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

const TONE = {
    green: "bg-brand-soft text-brand-deep",
    yellow: "bg-sun-soft text-[#7a5d00]",
    red: "bg-coral-soft text-[#b4432a]",
    blue: "bg-sky-soft text-[#1d6f9c]",
    gray: "bg-ink/[0.06] text-ink-soft",
};
const DEFAULT_TONES = { ACTIVE: "green", INACTIVE: "gray", DISABLED: "gray", PAID: "green", PARTIAL: "yellow", DUE: "red", VALID: "green", REVERSED: "red", DELIVERED: "green", PENDING: "yellow", FAILED: "red", PUBLISHED: "green", MARKS_OPEN: "blue", LOCKED: "yellow", DRAFT: "gray" };
const pretty = (s) => String(s).replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

function Cell({ col, row, href }) {
    const v = row[col.key];
    let content;
    switch (col.type) {
        case "money":
            content = `৳ ${new Intl.NumberFormat("en-IN").format(v ?? 0)}`;
            break;
        case "number":
            content = v ?? "—";
            break;
        case "date":
            content = v ? new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", day: "numeric", month: "short", year: "numeric" }).format(new Date(v)) : "—";
            break;
        case "datetime":
            content = v ? new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(v)) : "—";
            break;
        case "badge": {
            const tone = col.badgeTones?.[v] ?? DEFAULT_TONES[v] ?? "gray";
            content = <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12.5px] font-medium whitespace-nowrap ${TONE[tone]}`}>{pretty(v)}</span>;
            break;
        }
        case "person": {
            const ini = String(v ?? "")
                .split(/\s+/)
                .slice(0, 2)
                .map((p) => p[0])
                .join("")
                .toUpperCase();
            content = (
                <span className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-[12.5px] font-semibold text-brand-deep" aria-hidden="true">
                        {ini}
                    </span>
                    <span className="min-w-0">
                        <span className="block font-medium text-ink">{v}</span>
                        {col.sub && <span className="block text-[12.5px] text-ink-soft">{row[col.sub]}</span>}
                    </span>
                </span>
            );
            break;
        }
        default:
            content = (
                <>
                    <span className="text-ink">{v ?? "—"}</span>
                    {col.sub && <span className="block text-[12.5px] text-ink-soft">{row[col.sub]}</span>}
                </>
            );
    }
    return href ? (
        <Link href={href} className="block hover:[&_span]:text-brand-deep">
            {content}
        </Link>
    ) : (
        content
    );
}
