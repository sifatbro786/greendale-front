import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { img } from "@/content/media";

import Photo from "../ui/Photo";
import SectionHeading from "../ui/SectionHeading";

/** Real worksheets from Greendale classes, fanned like papers on a desk. */
export default function Classroom() {
    const sheets = [
        { image: img.wsIsAmAre, cls: "-rotate-6 translate-y-6" },
        { image: img.wsPhonics, cls: "z-10 rotate-1 -translate-y-2 scale-105" },
        { image: img.wsVerbs, cls: "rotate-6 translate-y-8" },
    ];
    const points = [
        ["Phonics", "Short vowels, digraphs, blends and sight words, one step at a time."],
        ["Grammar", "Is, am, are, action verbs and simple sentences with pictures."],
        ["Handwriting", "Tracing in Nursery to neat, joined writing in the upper classes."],
    ];
    return (
        <section className="container-x py-20 sm:py-28" aria-labelledby="classroom-title">
            <div className="grid items-center gap-14 lg:grid-cols-2">
                <div className="order-2 lg:order-1">
                    <SectionHeading
                        eyebrow="Inside our classroom"
                        title={<span id="classroom-title">Worksheets made with care, by our own teachers</span>}
                        intro="Colourful practice sheets help children enjoy what they learn in class. Here are a few from Class I."
                    />
                    <dl className="mt-8 divide-y divide-line border-y border-line">
                        {points.map(([t, d]) => (
                            <div key={t} className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                                <dt className="font-semibold text-brand-deep">{t}</dt>
                                <dd className="text-[15.5px] text-ink-soft">{d}</dd>
                            </div>
                        ))}
                    </dl>
                    <Link href="/academics/curriculum" className="mt-8 inline-flex items-center gap-2 font-semibold text-brand-deep hover:text-brand">
                        Our curriculum & approach <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                </div>

                <div className="order-1 flex justify-center px-4 pb-8 lg:order-2">
                    {sheets.map((s) => (
                        <div
                            key={s.image.src}
                            className={`relative -mx-6 aspect-[2/3] w-1/3 max-w-[200px] overflow-hidden rounded-md border-4 border-white bg-white shadow-[0_20px_40px_-18px_rgba(21,36,27,.5)] transition-transform duration-300 hover:z-20 hover:-translate-y-3 sm:-mx-4 ${s.cls}`}
                        >
                            <Photo image={s.image} fill sizes="(min-width:1024px) 200px, 33vw" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
