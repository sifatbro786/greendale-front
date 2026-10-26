import { MapPin, Phone } from "lucide-react";
import Link from "next/link";

import { school } from "@/config/school";
import { img } from "@/content/media";

import Photo from "../ui/Photo";
import { WhatsAppIcon } from "../site/SocialIcons";

/** @param {{ steps: {title:string,text:string}[] }} props */
export default function AdmissionVisit({ steps }) {
    const c = school.contact;
    return (
        <section className="container-x pb-24" aria-labelledby="admission-title">
            <div className="grid overflow-hidden rounded-[2rem] bg-brand text-white lg:grid-cols-[1.3fr_1fr]">
                <div className="paper-grain p-7 sm:p-12">
                    <p className="eyebrow text-sun">Admission going on</p>
                    <h2 id="admission-title" className="h-section mt-3 text-white">Come and see Greendale for yourself</h2>
                    <ol className="mt-8 grid gap-4 sm:grid-cols-2">
                        {steps.map((s, i) => (
                            <li key={s.title} className="rounded-2xl bg-white/10 p-5">
                                <span className="grid size-8 place-items-center rounded-full bg-sun text-sm font-bold text-ink">{i + 1}</span>
                                <p className="mt-3 font-semibold">{s.title}</p>
                                <p className="mt-1 text-[14.5px] leading-relaxed text-white/75">{s.text}</p>
                            </li>
                        ))}
                    </ol>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <a href={c.phoneHref} className="btn-sun">
                            <Phone className="size-4" aria-hidden="true" /> {c.phone}
                        </a>
                        <a href={c.whatsappHref} target="_blank" rel="noopener noreferrer" className="btn bg-white text-brand-deep hover:bg-brand-soft">
                            <WhatsAppIcon className="size-4" /> WhatsApp us
                        </a>
                        <Link href="/admission/information" className="btn border border-white/30 text-white hover:bg-white/10">
                            Admission details
                        </Link>
                    </div>
                </div>
                <div className="relative min-h-[280px] bg-brand-deep">
                    <Photo image={img.scienceProject} fill sizes="(min-width:1024px) 480px, 100vw" />
                    <div className="absolute right-4 bottom-4 left-4 flex items-start gap-3 rounded-2xl bg-white p-4 text-ink shadow-lg">
                        <MapPin className="mt-0.5 size-5 shrink-0 text-coral" aria-hidden="true" />
                        <div className="text-[14.5px] leading-snug">
                            <p className="font-semibold">{c.addressLines[0]}</p>
                            <p className="text-ink-soft">{c.addressLines[1]}</p>
                            <Link href="/contact" className="mt-1.5 inline-block font-semibold text-brand-deep">Get directions →</Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
