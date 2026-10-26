import { AudioLines, BookOpenText, GraduationCap, Languages, PenLine, Snowflake } from "lucide-react";

import { img } from "@/content/media";

import Photo from "../ui/Photo";
import SectionHeading from "../ui/SectionHeading";

const items = [
    { icon: Languages, title: "English Version", text: "Every subject taught in English from Play Group, so it becomes natural.", tone: "bg-brand-soft text-brand" },
    { icon: Snowflake, title: "AC classrooms", text: "Cool, comfortable rooms that keep little minds fresh all day.", tone: "bg-sky-soft text-sky" },
    { icon: BookOpenText, title: "Free Arabic learning", text: "Arabic reading lessons for every child at no extra cost.", tone: "bg-sun-soft text-[#9a7400]" },
    { icon: GraduationCap, title: "Qualified teachers", text: "Highly qualified, experienced teachers who know each child.", tone: "bg-coral-soft text-coral" },
    { icon: PenLine, title: "Handwriting focus", text: "Grip, letter shapes and spacing practised every single day.", tone: "bg-brand-soft text-brand" },
    { icon: AudioLines, title: "Spoken English & phonics", text: "Sounds first, then words, then confident little speakers.", tone: "bg-sky-soft text-sky" },
];

export default function WhyUs() {
    return (
        <section className="container-x py-20 sm:py-28" aria-labelledby="why-title">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
                <div className="lg:sticky lg:top-28 lg:self-start">
                    <SectionHeading
                        eyebrow="Why parents choose us"
                        title={<span id="why-title">Small things, done well, every day</span>}
                        intro="These are the things Greendale parents mention most when they recommend us to friends."
                    />
                    <figure className="relative mt-10 hidden aspect-[16/10] overflow-hidden rounded-[1.5rem] lg:block">
                        <Photo image={img.playZone} fill sizes="480px" />
                        <figcaption className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-[13px] font-semibold text-ink">
                            Our kids&apos; play zone
                        </figcaption>
                    </figure>
                </div>

                <ul className="grid gap-4 sm:grid-cols-2">
                    {items.map(({ icon: Icon, title, text, tone }, i) => (
                        <li key={title} className={`group rounded-[1.25rem] border border-line bg-white p-6 transition-shadow hover:shadow-[0_18px_40px_-24px_rgba(21,36,27,.4)] ${i % 2 ? "sm:translate-y-6" : ""}`}>
                            <div className="flex items-start justify-between">
                                <span className={`grid size-12 place-items-center rounded-2xl ${tone}`}>
                                    <Icon className="size-6" aria-hidden="true" />
                                </span>
                                <span className="text-sm font-semibold text-ink/25 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                            </div>
                            <h3 className="mt-5 text-lg font-semibold text-ink">{title}</h3>
                            <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{text}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
