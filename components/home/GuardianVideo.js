import { school } from "@/config/school";

import LiteYouTube from "../ui/LiteYouTube";
import { Sparkle } from "../ui/Decor";

export default function GuardianVideo() {
    const v = school.videos.guardianGuide;
    return (
        <section className="container-x py-20 sm:py-28" aria-labelledby="guardian-title">
            <div className="relative overflow-hidden rounded-[2rem] bg-sky-soft px-5 py-10 sm:px-10 sm:py-14 lg:px-14">
                <div className="dot-grid absolute inset-0 opacity-40" aria-hidden="true" />
                <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_1.25fr]">
                    <div>
                        <p className="inline-flex -rotate-2 items-center gap-2 rounded-lg bg-coral px-3 py-1.5 text-[13px] font-semibold text-white shadow-[2px_3px_0_rgba(0,0,0,.18)]">
                            <Sparkle className="size-3" /> Must watch
                        </p>
                        <h2 id="guardian-title" className="h-section mt-5">For every Greendale student and guardian</h2>
                        <p className="mt-4 max-w-md text-[17px] leading-relaxed text-ink-soft">
                            A short video the school wants every family to see. Watch it together with your child.
                        </p>
                        <a href={school.social.youtube} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-7">
                            More on our YouTube channel
                        </a>
                    </div>
                    <div className="rounded-[1.4rem] bg-white p-2 shadow-[0_24px_50px_-28px_rgba(21,36,27,.45)]">
                        <LiteYouTube id={v.id} title={v.title} className="rounded-[1rem]" />
                    </div>
                </div>
            </div>
        </section>
    );
}
