"use client";

import { useRef, useState } from "react";

/**
 * Self-hosted video with poster + big play button. Nothing downloads until play (preload="none").
 */
export default function VideoPlayer({ src, poster, title, portrait = false, fill = false, className = "" }) {
    const ref = useRef(null);
    const [playing, setPlaying] = useState(false);

    function play() {
        setPlaying(true);
        requestAnimationFrame(() => ref.current?.play().catch(() => {}));
    }

    return (
        <div className={`relative overflow-hidden bg-ink ${fill ? "size-full" : portrait ? "aspect-[4/5]" : "aspect-video"} ${className}`}>
            <video
                ref={ref}
                src={src}
                poster={poster}
                preload="none"
                playsInline
                controls={playing}
                className="absolute inset-0 size-full object-cover"
                aria-label={title}
            />
            {!playing && (
                <button
                    type="button"
                    onClick={play}
                    className="group absolute inset-0 size-full cursor-pointer"
                    aria-label={`Play video: ${title}`}
                >
                    <span className="absolute inset-0 bg-linear-to-t from-ink/65 via-transparent to-transparent" />
                    <span className="absolute top-1/2 left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-brand shadow-lg transition-transform group-hover:scale-110">
                        <svg viewBox="0 0 24 24" className="ml-0.5 size-6" aria-hidden="true">
                            <path fill="currentColor" d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11-6.86a1 1 0 0 0 0-1.7l-11-6.86A1 1 0 0 0 8 5.14z" />
                        </svg>
                    </span>
                    <span className="absolute right-4 bottom-3 left-4 text-left text-sm font-semibold text-white">{title}</span>
                </button>
            )}
        </div>
    );
}
