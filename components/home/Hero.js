import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { school } from "@/config/school";
import { video } from "@/content/media";

import { Swoosh } from "../ui/Decor";
import HeroVideo from "./HeroVideo";

const stages = [
    { label: "Early Years", note: "Play Group · Nursery · KG", href: "/academics/classes#early" },
    { label: "Primary", note: "Class I to Class V", href: "/academics/classes#primary" },
];

/**
 * Inset video hero (pattern from the reference: framed media, headline bottom-left, quick links right).
 * The video starts muted (autoplay rule) with a sound toggle; poster renders first so LCP is an image.
 */
export default function Hero() {
    return (
        <section className="px-2 pt-2 sm:px-4 sm:pt-4" aria-labelledby="hero-title">
            <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-brand-deep sm:rounded-[2.25rem]">
                <HeroVideo src={video.hero.src} poster={video.hero.poster} />
                <div className="absolute inset-0 -z-10 bg-linear-to-tr from-[#06321a]/95 via-[#0b4a27]/70 to-[#0b4a27]/10" aria-hidden="true" />

                <div className="container-x grid min-h-[min(80svh,760px)] items-end gap-10 pb-8 sm:pb-12 lg:grid-cols-[1.5fr_1fr] lg:pb-16">
                    <div className="max-w-3xl">
                        <p className="inline-flex -rotate-1 items-center gap-2 rounded-full bg-sun px-3.5 py-1.5 text-[13.5px] font-semibold text-ink shadow-[0_3px_0_rgba(0,0,0,.25)]">
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-70" />
                                <span className="relative inline-flex size-2 rounded-full bg-brand" />
                            </span>
                            Admission going on · {school.levels}
                        </p>
                        <h1 id="hero-title" className="mt-6 text-[2.5rem] leading-[1.04] font-semibold tracking-tight text-white sm:text-6xl lg:text-[4rem]">
                            A happy start in{" "}
                            <span className="relative inline-block whitespace-nowrap text-sun">
                                English
                                <Swoosh className="absolute -bottom-2 left-0 h-3 w-full text-sun/70" />
                            </span>
                            , right here in Mirpur.
                        </h1>
                        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/80 sm:text-lg">
                            English Version from Play Group to Class V, with special care for handwriting, spoken
                            English and phonics, and free Arabic for every child.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link href="/admission/information" className="btn-sun">
                                Admission information
                                <ArrowUpRight className="size-4" aria-hidden="true" />
                            </Link>
                            <a href={school.contact.phoneHref} className="btn border border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20">
                                Call {school.contact.phone}
                            </a>
                        </div>
                    </div>

                    <ul className="hidden self-end lg:block">
                        {stages.map((s) => (
                            <li key={s.label} className="border-t border-white/25 first:border-t-0">
                                <Link href={s.href} className="group flex items-end justify-between gap-6 py-5 text-white">
                                    <span>
                                        <span className="block text-2xl font-semibold">{s.label}</span>
                                        <span className="mt-1 block text-[15px] text-white/70">{s.note}</span>
                                    </span>
                                    <span className="grid size-11 place-items-center rounded-full border border-white/30 transition-colors group-hover:border-sun group-hover:bg-sun group-hover:text-ink">
                                        <ArrowUpRight className="size-5" aria-hidden="true" />
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Mobile quick links */}
            <ul className="mt-2 grid grid-cols-2 gap-2 lg:hidden">
                {stages.map((s, i) => (
                    <li key={s.label}>
                        <Link href={s.href} className={`flex h-full flex-col justify-between gap-3 rounded-2xl p-4 ${i ? "bg-sky-soft" : "bg-coral-soft"}`}>
                            <span className="text-[17px] font-semibold text-ink">{s.label}</span>
                            <span className="text-[13.5px] leading-snug text-ink-soft">{s.note}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
