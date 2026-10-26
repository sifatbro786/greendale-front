import { ArrowRight, Quote } from "lucide-react";
import Link from "next/link";

import { school } from "@/config/school";

import LiteYouTube from "../ui/LiteYouTube";
import { Tape } from "../ui/Decor";

export default function Chairman() {
    const c = school.leadership.chairman;
    const v = school.videos.chairmanTalk;
    return (
        <section className="bg-sun-soft py-20 sm:py-24" aria-labelledby="chairman-title">
            <div className="container-x grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
                <div className="relative">
                    <Tape className="-top-3 left-8 z-10 -rotate-6" tone="coral" />
                    <Tape className="-right-3 -bottom-2 z-10 rotate-[-38deg]" tone="sky" />
                    <div className="rounded-[1.5rem] bg-white p-2.5 shadow-[0_30px_60px_-30px_rgba(21,36,27,.45)]">
                        <LiteYouTube id={v.id} title={v.title} className="rounded-[1.1rem]" />
                    </div>
                </div>
                <div>
                    <p className="eyebrow">From the {c.title}</p>
                    <Quote className="mt-5 size-10 text-sun" aria-hidden="true" />
                    <h2 id="chairman-title" className="mt-3 text-[1.7rem] leading-snug font-semibold text-ink sm:text-[2.1rem]">
                        Hear in his own words why Greendale was started and how we care for every child.
                    </h2>
                    <div className="mt-7 flex items-center gap-4 border-t border-ink/10 pt-6">
                        <span className="grid size-12 place-items-center rounded-full bg-brand text-lg font-semibold text-white" aria-hidden="true">
                            {c.name.split(" ").map((p) => p[0]).join("")}
                        </span>
                        <div>
                            <p className="text-lg font-semibold text-ink">{c.name}</p>
                            <p className="text-[15px] text-ink-soft">
                                {c.knownAs} · {c.title}
                            </p>
                        </div>
                    </div>
                    <Link href="/about/chairman-message" className="mt-8 inline-flex items-center gap-2 font-semibold text-brand-deep hover:text-brand">
                        Read the Chairman&apos;s message
                        <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
