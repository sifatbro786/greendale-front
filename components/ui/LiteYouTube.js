"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Click-to-load YouTube facade: no third-party iframe/JS until the visitor taps play.
 * Keeps Lighthouse performance high on phones.
 */
export default function LiteYouTube({ id, title, className = "" }) {
    const [active, setActive] = useState(false);
    return (
        <div className={`relative aspect-video overflow-hidden bg-ink ${className}`}>
            {active ? (
                <iframe
                    className="absolute inset-0 size-full"
                    src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                />
            ) : (
                <button
                    type="button"
                    onClick={() => setActive(true)}
                    className="group absolute inset-0 size-full cursor-pointer"
                    aria-label={`Play video: ${title}`}
                >
                    <Image
                        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 640px, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <span className="absolute inset-0 bg-linear-to-t from-ink/60 via-ink/10 to-transparent" />
                    <span className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-sun text-ink shadow-lg ring-8 ring-white/25 transition-transform group-hover:scale-110 sm:size-20">
                        <svg viewBox="0 0 24 24" className="ml-1 size-7 sm:size-8" aria-hidden="true">
                            <path fill="currentColor" d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11-6.86a1 1 0 0 0 0-1.7l-11-6.86A1 1 0 0 0 8 5.14z" />
                        </svg>
                    </span>
                    <span className="absolute bottom-3 left-4 right-4 line-clamp-1 text-left text-sm font-medium text-white sm:bottom-4">
                        {title}
                    </span>
                </button>
            )}
        </div>
    );
}
