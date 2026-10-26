import { Clock } from "lucide-react";
import Link from "next/link";

import { school } from "@/config/school";

import { Sparkle } from "../ui/Decor";

/** Clean "coming soon" state for Phase 3 features (Online Result, Portal Login). */
export default function ComingSoon({ title, text, children }) {
    return (
        <section className="container-x py-16 sm:py-24">
            <div className="relative mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-line bg-white px-6 py-12 text-center sm:px-12 sm:py-16">
                <div className="dot-grid absolute inset-x-0 top-0 h-32 opacity-50 [mask-image:linear-gradient(#000,transparent)]" aria-hidden="true" />
                <span className="relative mx-auto grid size-16 place-items-center rounded-2xl bg-sun-soft text-[#9a7400]">
                    <Clock className="size-8" aria-hidden="true" />
                </span>
                <h1 className="relative mt-6 text-3xl font-semibold text-ink sm:text-4xl">{title}</h1>
                <p className="relative mx-auto mt-3 max-w-md text-[16.5px] leading-relaxed text-ink-soft">{text}</p>
                {children}
                <div className="relative mt-8 flex flex-wrap justify-center gap-3">
                    <Link href="/notices" className="btn-ghost">See notices</Link>
                    <a href={school.contact.phoneHref} className="btn-primary">Call the office</a>
                </div>
                <Sparkle className="absolute top-6 right-8 size-6 text-sun" />
            </div>
        </section>
    );
}
