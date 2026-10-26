import { TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

import { Icon } from "./icons";

/** Page heading with optional breadcrumb + actions. */
export function PageHead({ title, description, crumbs, actions }) {
    return (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                {crumbs?.length > 0 && (
                    <nav aria-label="Breadcrumb" className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[13px] text-ink-soft">
                        {crumbs.map((c, i) => (
                            <span key={c.label} className="flex items-center gap-1.5">
                                {i > 0 && <span aria-hidden="true">/</span>}
                                {c.href ? (
                                    <Link href={c.href} className="hover:text-brand">
                                        {c.label}
                                    </Link>
                                ) : (
                                    <span>{c.label}</span>
                                )}
                            </span>
                        ))}
                    </nav>
                )}
                <h1 className="text-[1.6rem] leading-tight font-semibold tracking-[-0.015em] text-ink sm:text-[1.85rem]">{title}</h1>
                {description && <p className="mt-1 max-w-2xl text-[15px] text-ink-soft">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
    );
}

export function Card({ title, description, actions, children, className = "", padded = true }) {
    return (
        <section className={`min-w-0 rounded-2xl border border-line bg-white ${className}`}>
            {(title || actions) && (
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
                    <div>
                        {title && <h2 className="text-[16px] font-semibold text-ink">{title}</h2>}
                        {description && <p className="mt-0.5 text-[13.5px] text-ink-soft">{description}</p>}
                    </div>
                    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
                </div>
            )}
            <div className={padded ? "p-5" : ""}>{children}</div>
        </section>
    );
}

const TONES = {
    brand: "bg-brand-soft text-brand",
    sun: "bg-sun-soft text-[#8a6a00]",
    sky: "bg-sky-soft text-sky",
    coral: "bg-coral-soft text-coral",
    ink: "bg-ink/5 text-ink",
};

/** KPI card. Static numbers (no count-up animation). */
export function StatCard({ label, value, hint, icon, tone = "brand", trend, href }) {
    const body = (
        <div className="flex h-full flex-col justify-between gap-4 rounded-2xl border border-line bg-white p-5 transition-shadow hover:shadow-[0_14px_34px_-24px_rgba(21,36,27,.5)]">
            <div className="flex items-start justify-between gap-3">
                <p className="text-[13.5px] font-medium text-ink-soft">{label}</p>
                {icon && (
                    <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${TONES[tone]}`}>
                        <Icon name={icon} className="size-5" />
                    </span>
                )}
            </div>
            <div>
                <p className="text-[1.75rem] leading-none font-semibold tracking-tight text-ink tabular-nums">{value}</p>
                {(hint || trend) && (
                    <p className="mt-2 flex items-center gap-1.5 text-[13px] text-ink-soft">
                        {trend && (trend.up ? <TrendingUp className="size-3.5 text-brand" aria-hidden="true" /> : <TrendingDown className="size-3.5 text-coral" aria-hidden="true" />)}
                        {hint}
                    </p>
                )}
            </div>
        </div>
    );
    return href ? (
        <Link href={href} className="block">
            {body}
        </Link>
    ) : (
        body
    );
}

const BADGE = {
    green: "bg-brand-soft text-brand-deep",
    yellow: "bg-sun-soft text-[#7a5d00]",
    red: "bg-coral-soft text-[#b4432a]",
    blue: "bg-sky-soft text-[#1d6f9c]",
    gray: "bg-ink/[0.06] text-ink-soft",
};

export function Badge({ tone = "gray", children, className = "" }) {
    return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12.5px] font-medium whitespace-nowrap ${BADGE[tone]} ${className}`}>{children}</span>;
}

/** Map of status → badge tone, shared by tables. */
export const STATUS_TONE = {
    ACTIVE: "green", INACTIVE: "gray", DISABLED: "gray",
    PRESENT: "green", ABSENT: "red", LATE: "yellow",
    PAID: "green", PARTIAL: "yellow", DUE: "red",
    VALID: "green", REVERSED: "red",
    DELIVERED: "green", PENDING: "yellow", FAILED: "red",
    DRAFT: "gray", MARKS_OPEN: "blue", LOCKED: "yellow", PUBLISHED: "green",
};

export function EmptyState({ title, text, icon = "Info", action }) {
    return (
        <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
                <Icon name={icon} className="size-6" />
            </span>
            <p className="mt-4 font-semibold text-ink">{title}</p>
            {text && <p className="mt-1 max-w-sm text-[14px] text-ink-soft">{text}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

export function Progress({ value, tone = "brand", label }) {
    const color = { brand: "bg-brand", sun: "bg-sun", coral: "bg-coral", sky: "bg-sky" }[tone];
    return (
        <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/[0.07]" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
                <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
            </div>
            <span className="w-11 text-right text-[13px] font-medium text-ink tabular-nums">{value}%</span>
        </div>
    );
}

export function Avatar({ name, size = "md", tone = "brand" }) {
    const s = { sm: "size-8 text-[12px]", md: "size-10 text-[14px]", lg: "size-16 text-xl" }[size];
    const t = { brand: "bg-brand text-white", soft: "bg-brand-soft text-brand-deep", sun: "bg-sun text-ink" }[tone];
    const ini = name
        .replace(/^Md\.\s*/i, "")
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase();
    return (
        <span className={`grid shrink-0 place-items-center rounded-full font-semibold ${s} ${t}`} aria-hidden="true">
            {ini}
        </span>
    );
}

/** Key/value list for profiles. */
export function DefinitionList({ items }) {
    return (
        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {items.map(([k, v]) => (
                <div key={k}>
                    <dt className="text-[12.5px] font-medium tracking-wide text-ink-soft uppercase">{k}</dt>
                    <dd className="mt-0.5 text-[15px] text-ink">{v || "—"}</dd>
                </div>
            ))}
        </dl>
    );
}
