import { ArrowRight, Pin } from "lucide-react";
import Link from "next/link";

import { dateParts, formatDate } from "@/lib/format";

import Photo from "../ui/Photo";
import SectionHeading from "../ui/SectionHeading";

/**
 * Notices (numbered list, like the reference's event list) + latest news.
 * @param {{ notices: import("@/lib/data/types").Notice[], news: import("@/lib/data/types").NewsPost[] }} props
 */
export default function Updates({ notices, news }) {
    const [lead, ...rest] = news;
    return (
        <section className="container-x py-20 sm:py-28" aria-labelledby="updates-title">
            <div className="flex flex-wrap items-end justify-between gap-6">
                <SectionHeading eyebrow="Notices, news & events" title={<span id="updates-title">What&apos;s happening at Greendale</span>} />
                <div className="flex gap-2">
                    <Link href="/notices" className="btn-ghost">All notices</Link>
                    <Link href="/news" className="btn-ghost">All news</Link>
                </div>
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.15fr]">
                {/* Notice board */}
                <div className="rounded-[1.5rem] border border-line bg-white p-2 sm:p-3">
                    <p className="px-4 pt-3 pb-2 text-[13px] font-semibold tracking-wider text-ink-soft uppercase">Notice board</p>
                    <ol>
                        {notices.map((n, i) => (
                            <li key={n.id} className="border-t border-line first:border-t-0">
                                <Link href={`/notices/${n.slug}`} className="group grid grid-cols-[auto_1fr] gap-5 rounded-xl px-4 py-5 hover:bg-paper">
                                    <span className="text-3xl font-semibold text-brand/30 tabular-nums transition-colors group-hover:text-brand">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <span>
                                        <span className="flex flex-wrap items-center gap-2 text-[13px] text-ink-soft">
                                            <time dateTime={n.publishedAt}>{formatDate(n.publishedAt)}</time>
                                            <span className="rounded-full bg-brand-soft px-2 py-0.5 font-medium text-brand-deep capitalize">{n.category}</span>
                                            {n.pinned && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-sun-soft px-2 py-0.5 font-medium text-[#8a6a00]">
                                                    <Pin className="size-3" aria-hidden="true" /> Pinned
                                                </span>
                                            )}
                                        </span>
                                        <span className="mt-1.5 block text-[17px] leading-snug font-semibold text-ink group-hover:text-brand-deep">{n.title}</span>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* News */}
                <div className="grid gap-6">
                    {lead && (
                        <Link href={`/news/${lead.slug}`} className="group relative block overflow-hidden rounded-[1.5rem]">
                            <div className="relative aspect-[16/10]">
                                <Photo image={lead.cover} fill ratio={16 / 10} sizes="(min-width:1024px) 600px, 100vw" className="transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/20 to-transparent" />
                            </div>
                            <div className="absolute right-0 bottom-0 left-0 p-6 text-white">
                                <DateChip iso={lead.publishedAt} />
                                <h3 className="mt-3 text-xl leading-snug font-semibold sm:text-2xl">{lead.title}</h3>
                            </div>
                        </Link>
                    )}
                    <ul className="grid gap-4 sm:grid-cols-2">
                        {rest.slice(0, 2).map((p) => (
                            <li key={p.id}>
                                <Link href={`/news/${p.slug}`} className="group flex gap-4 rounded-2xl border border-line bg-white p-3">
                                    <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl">
                                        <Photo image={p.cover} fill ratio={1} sizes="96px" />
                                    </div>
                                    <div className="py-1">
                                        <time dateTime={p.publishedAt} className="text-[13px] text-ink-soft">{formatDate(p.publishedAt)}</time>
                                        <h3 className="mt-1 line-clamp-3 leading-snug font-semibold text-ink group-hover:text-brand-deep">{p.title}</h3>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <Link href="/news" className="inline-flex items-center gap-2 font-semibold text-brand-deep hover:text-brand sm:hidden">
                        More news <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

function DateChip({ iso }) {
    const d = dateParts(iso);
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sun px-3 py-1 text-[13px] font-semibold text-ink">
            {d.day} {d.month} {d.year}
        </span>
    );
}
