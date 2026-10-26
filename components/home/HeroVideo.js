"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";

/**
 * Hero background video with a sound toggle.
 * Browsers only allow muted autoplay, so it always starts muted; the visitor opts in to sound.
 */
export default function HeroVideo({ src, poster }) {
    const ref = useRef(null);
    const [muted, setMuted] = useState(true);

    function toggle() {
        const v = ref.current;
        if (!v) return;
        const next = !muted;
        v.muted = next;
        if (!next) {
            v.volume = 1;
            if (v.paused) v.play().catch(() => {});
        }
        setMuted(next);
    }

    return (
        <>
            <div className="relative aspect-video w-full lg:absolute lg:inset-0 lg:-z-10 lg:aspect-auto">
                <video
                    ref={ref}
                    className="absolute inset-0 size-full object-cover"
                    src={src}
                    poster={poster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-hidden="true"
                    tabIndex={-1}
                />
                {/* Phones: the video sits in its own 16:9 frame (no extreme zoom of a 720px source), fading into the panel */}
                <div className="absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-brand-deep to-transparent lg:hidden" aria-hidden="true" />
            </div>
            {/* Outside the video wrapper: on desktop that wrapper sits at -z-10 (behind the text), which made the button unclickable. */}
            <button
                type="button"
                onClick={toggle}
                aria-pressed={!muted}
                aria-label={muted ? "Turn video sound on" : "Turn video sound off"}
                className="absolute top-3 right-3 z-20 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 bg-ink/35 px-3.5 text-[13.5px] font-semibold text-white backdrop-blur transition-colors hover:bg-ink/55 sm:top-6 sm:right-6"
            >
                {muted ? <VolumeX className="size-4.5" aria-hidden="true" /> : <Volume2 className="size-4.5 text-sun" aria-hidden="true" />}
                <span className="hidden sm:inline">{muted ? "Sound on" : "Sound off"}</span>
            </button>
        </>
    );
}
