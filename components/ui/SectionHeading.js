import { Sparkle } from "./Decor";

/** Eyebrow + title + optional intro. `align` center|left. */
export default function SectionHeading({ eyebrow, title, intro, align = "left", tone = "light", className = "" }) {
    const center = align === "center";
    const dark = tone === "dark";
    return (
        <div className={`${center ? "mx-auto text-center" : ""} max-w-2xl ${className}`}>
            {eyebrow && (
                <p className={`eyebrow ${dark ? "text-sun" : ""} ${center ? "justify-center" : ""}`}>
                    <Sparkle className="size-3.5" />
                    {eyebrow}
                </p>
            )}
            <h2 className={`h-section mt-3 ${dark ? "text-white" : "text-ink"}`}>{title}</h2>
            {intro && (
                <p className={`mt-4 text-[17px] leading-relaxed ${dark ? "text-white/75" : "text-ink-soft"}`}>{intro}</p>
            )}
        </div>
    );
}
