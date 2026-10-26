"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Album grid + accessible lightbox (Esc, arrow keys, swipe).
 * @param {{ images: import("@/lib/data/types").ImageRef[] }} props
 */
export default function Lightbox({ images }) {
    const [index, setIndex] = useState(-1);
    const open = index >= 0;
    const startX = useRef(0);
    const go = useCallback((d) => setIndex((i) => (i + d + images.length) % images.length), [images.length]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") setIndex(-1);
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
        };
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open, go]);

    return (
        <>
            <ul className="columns-2 gap-3 sm:columns-3 sm:gap-4 [&>li]:mb-3 sm:[&>li]:mb-4">
                {images.map((img, i) => (
                    <li key={img.src} className="break-inside-avoid">
                        <button
                            type="button"
                            onClick={() => setIndex(i)}
                            className="group block w-full cursor-zoom-in overflow-hidden rounded-[1rem] bg-brand-soft"
                            aria-label={`Open photo: ${img.alt}`}
                        >
                            <Image
                                src={img.src}
                                alt={img.alt}
                                width={img.width}
                                height={img.height}
                                sizes="(min-width:640px) 33vw, 50vw"
                                quality={85}
                                className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                        </button>
                    </li>
                ))}
            </ul>

            {open && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Photo viewer"
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/95 p-4"
                    onClick={() => setIndex(-1)}
                    onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
                    onTouchEnd={(e) => {
                        const dx = e.changedTouches[0].clientX - startX.current;
                        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
                    }}
                >
                    <div className="relative h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
                        <Image src={images[index].src} alt={images[index].alt} fill sizes="100vw" quality={85} className="object-contain" />
                    </div>
                    <p className="absolute bottom-5 left-1/2 w-[90%] -translate-x-1/2 text-center text-sm text-white/80">
                        {images[index].alt} · {index + 1}/{images.length}
                    </p>
                    <button type="button" onClick={() => setIndex(-1)} className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Close">
                        <X className="size-5" aria-hidden="true" />
                    </button>
                    {images.length > 1 && (
                        <>
                            <button type="button" onClick={(e) => (e.stopPropagation(), go(-1))} className="absolute left-3 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Previous photo">
                                <ChevronLeft className="size-6" aria-hidden="true" />
                            </button>
                            <button type="button" onClick={(e) => (e.stopPropagation(), go(1))} className="absolute right-3 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Next photo">
                                <ChevronRight className="size-6" aria-hidden="true" />
                            </button>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
