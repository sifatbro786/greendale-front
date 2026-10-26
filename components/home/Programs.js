import { ArrowRight } from "lucide-react";
import Link from "next/link";

import SectionHeading from "../ui/SectionHeading";

/**
 * Three columns, middle one filled (pattern from the reference "Academics & Program").
 * @param {{ classes: import("@/lib/data/types").SchoolClass[] }} props
 */
export default function Programs({ classes }) {
    const early = classes.filter((c) => c.stage === "early");
    const primary = classes.filter((c) => c.stage === "primary");
    const extras = [
        { label: "Phonics", href: "/academics/curriculum" },
        { label: "Handwriting", href: "/academics/curriculum" },
        { label: "Spoken English", href: "/academics/curriculum" },
        { label: "Free Arabic", href: "/academics/curriculum" },
        { label: "Art & activities", href: "/academics/activities" },
    ];

    const cols = [
        { title: "Early Years", note: "Learning through play, songs and stories.", items: early.map((c) => ({ label: c.name, href: `/academics/classes#${c.slug}` })), filled: false },
        { title: "Primary", note: "Strong basics in every subject, taught in English.", items: primary.map((c) => ({ label: c.name, href: `/academics/classes#${c.slug}` })), filled: true },
        { title: "Every day extras", note: "The skills that make Greendale different.", items: extras, filled: false },
    ];

    return (
        <section className="container-x py-20 sm:py-28" aria-labelledby="programs-title">
            <SectionHeading align="center" eyebrow="Classes & learning" title={<span id="programs-title">Play Group to Class V, step by step</span>} />
            <div className="mt-12 grid overflow-hidden rounded-[1.5rem] border border-line bg-white md:grid-cols-3">
                {cols.map((col) => (
                    <div key={col.title} className={`p-7 sm:p-9 ${col.filled ? "bg-brand text-white" : "bg-white"} not-last:border-b md:not-last:border-r md:not-last:border-b-0 border-line`}>
                        <h3 className={`text-2xl font-semibold ${col.filled ? "text-white" : "text-ink"}`}>{col.title}</h3>
                        <p className={`mt-2 text-[15px] ${col.filled ? "text-white/80" : "text-ink-soft"}`}>{col.note}</p>
                        <ul className="mt-6 flex flex-wrap gap-2 md:flex-col md:items-start md:gap-2.5">
                            {col.items.map((it) => (
                                <li key={it.label}>
                                    <Link
                                        href={it.href}
                                        className={`pill-link ${col.filled ? "border-white/40 text-white hover:bg-white hover:text-brand-deep" : "border-line text-ink hover:border-brand hover:text-brand"}`}
                                    >
                                        {it.label}
                                        <ArrowRight className="size-3.5" aria-hidden="true" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}
