import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { img } from "@/content/media";

import Photo from "../ui/Photo";
import { Scallop, Sparkle } from "../ui/Decor";

const cards = [
    { title: "In the classroom", text: "Drawing, projects and reading corners.", image: img.drawingClass, href: "/gallery/classroom-life" },
    { title: "Celebrations", text: "Birthdays, cultural days and Teachers' Day.", image: img.birthdayCake, href: "/gallery/celebrations" },
    { title: "Art on a big stage", text: "Prizes at the KPR International Art Exhibition.", image: img.artWinners, href: "/gallery/art-exhibition-2026" },
];

export default function CampusLife() {
    return (
        <section aria-labelledby="campus-title" className="mt-4">
            <Scallop color="var(--brand-deep)" />
            <div className="paper-grain relative bg-brand-deep pt-16 pb-20 text-white sm:pt-20 sm:pb-28">
                <div className="container-x">
                    <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
                        <div>
                            <p className="eyebrow text-sun"><Sparkle className="size-3.5" />Campus life</p>
                            <h2 id="campus-title" className="mt-3 text-[2.6rem] leading-none font-semibold tracking-[-0.025em] sm:text-6xl lg:text-7xl">
                                Every day has
                                <br />
                                <span className="text-sun">a little colour.</span>
                            </h2>
                        </div>
                        <p className="max-w-md text-[17px] leading-relaxed text-white/75 lg:justify-self-end">
                            School is where children make friends, try new things and discover what they love. Here is a
                            peek at life at Greendale.
                        </p>
                    </div>

                    <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {cards.map((c, i) => (
                            <li key={c.title} className={i === 1 ? "lg:translate-y-8" : ""}>
                                <Link href={c.href} className="group block">
                                    <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem]">
                                        <Photo image={c.image} fill ratio={4 / 3} sizes="(min-width:1024px) 380px, (min-width:640px) 50vw, 100vw" className="transition-transform duration-700 group-hover:scale-105" />
                                    </div>
                                    <div className="mt-4 flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-semibold">{c.title}</h3>
                                            <p className="mt-1 text-[15px] text-white/70">{c.text}</p>
                                        </div>
                                        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/25 transition-colors group-hover:bg-sun group-hover:text-ink">
                                            <ArrowUpRight className="size-4.5" aria-hidden="true" />
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <Scallop color="var(--brand-deep)" flip />
        </section>
    );
}
