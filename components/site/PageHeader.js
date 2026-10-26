import Link from "next/link";

import Photo from "../ui/Photo";
import { Sparkle } from "../ui/Decor";

/**
 * Inner-page header: breadcrumb, title, summary, optional photo panel.
 * @param {{ title: string, summary?: string, crumbs?: {label:string, href?:string}[], image?: import("@/lib/data/types").ImageRef, tone?: "brand"|"sun"|"sky"|"coral" }} props
 */
export default function PageHeader({ title, summary, crumbs = [], image, tone = "brand" }) {
    const toneBg = { brand: "bg-brand-soft", sun: "bg-sun-soft", sky: "bg-sky-soft", coral: "bg-coral-soft" }[tone];
    return (
        <section className={`relative overflow-hidden ${toneBg}`}>
            <div className="dot-grid absolute inset-y-0 right-0 w-1/2 opacity-60 [mask-image:linear-gradient(90deg,transparent,#000)]" aria-hidden="true" />
            <div className={`container-x relative grid gap-8 py-10 sm:py-14 ${image ? "lg:grid-cols-[1.15fr_1fr] lg:items-center" : ""}`}>
                <div>
                    <nav aria-label="Breadcrumb">
                        <ol className="flex flex-wrap items-center gap-1.5 text-[13.5px] text-ink-soft">
                            <li>
                                <Link href="/" className="hover:text-brand">Home</Link>
                            </li>
                            {crumbs.map((c) => (
                                <li key={c.label} className="flex items-center gap-1.5">
                                    <span aria-hidden="true">/</span>
                                    {c.href ? (
                                        <Link href={c.href} className="hover:text-brand">{c.label}</Link>
                                    ) : (
                                        <span className="text-ink" aria-current="page">{c.label}</span>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </nav>
                    <h1 className="h-display mt-5 max-w-3xl text-ink">{title}</h1>
                    {summary && <p className="mt-4 max-w-2xl text-[17.5px] leading-relaxed text-ink-soft">{summary}</p>}
                </div>
                {image && (
                    <div className="relative hidden lg:block">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border-[6px] border-white shadow-[0_24px_50px_-24px_rgba(21,36,27,.45)]">
                            <Photo image={image} fill ratio={4 / 3} sizes="(min-width:1024px) 520px, 1px" priority />
                        </div>
                        <Sparkle className="absolute -top-4 -left-4 size-9 text-sun" />
                    </div>
                )}
            </div>
        </section>
    );
}
