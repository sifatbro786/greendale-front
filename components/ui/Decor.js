import { useId } from "react";

/* Small hand-made decorative pieces. Pure SVG, no client JS. */

/** Circular rotating text badge (inspired by the reference site), crest in the middle. */
export function RotatingBadge({ text, className = "", children, tone = "brand" }) {
    const id = `badge-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
    const fill = tone === "sun" ? "var(--sun)" : "var(--brand)";
    const ink = tone === "sun" ? "var(--ink)" : "#fff";
    return (
        <div className={`relative grid aspect-square place-items-center ${className}`} aria-hidden="true">
            <svg viewBox="0 0 200 200" className="absolute inset-0 size-full animate-spin-slow">
                <circle cx="100" cy="100" r="98" fill={fill} />
                <circle cx="100" cy="100" r="62" fill="none" stroke={ink} strokeOpacity=".35" strokeDasharray="2 5" />
                <defs>
                    <path id={id} d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
                </defs>
                <text fill={ink} fontSize="15.5" fontWeight="600" letterSpacing="3.2">
                    <textPath href={`#${id}`}>{text}</textPath>
                </text>
            </svg>
            <div className="relative grid size-[52%] place-items-center">{children}</div>
        </div>
    );
}

/**
 * Scalloped edge — sits on top of a coloured band. `color` is the band colour.
 * Overlaps the band by 2px so sub-pixel rounding never shows a hairline seam between them.
 */
export function Scallop({ color = "var(--brand-deep)", className = "", flip = false }) {
    return (
        <svg
            viewBox="0 0 1200 24"
            preserveAspectRatio="none"
            className={`relative z-[1] block h-4 w-full sm:h-6 ${flip ? "-mt-0.5 rotate-180" : "-mb-0.5"} ${className}`}
            aria-hidden="true"
        >
            <path
                fill={color}
                d="M0 24V12c25 0 25-12 50-12s25 12 50 12 25-12 50-12 25 12 50 12 25-12 50-12 25 12 50 12 25-12 50-12 25 12 50 12 25-12 50-12 25 12 50 12 25-12 50-12 25 12 50 12 25-12 50-12 25 12 50 12 25-12 50-12 25 12 50 12 25-12 50-12 25 12 50 12 25-12 50-12 25 12 50 12 25-12 50-12 25 12 50 12 25-12 50-12 25 12 50 12 25-12 50-12 25 12 50 12 25-12 50-12 25 12 50 12v12z"
            />
        </svg>
    );
}

/** Tiny four-point sparkle used as a separator. */
export function Sparkle({ className = "" }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
            <path fill="currentColor" d="M12 0c1 6.5 5.5 11 12 12-6.5 1-11 5.5-12 12-1-6.5-5.5-11-12-12C6.5 11 11 6.5 12 0z" />
        </svg>
    );
}

/** Hand-drawn underline swoosh for one emphasised word. */
export function Swoosh({ className = "" }) {
    return (
        <svg viewBox="0 0 220 18" preserveAspectRatio="none" className={className} aria-hidden="true">
            <path
                d="M3 13c40-7 92-11 140-9 25 1 50 3 74 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
            />
        </svg>
    );
}

/** Strip of washi tape for photo corners. */
export function Tape({ className = "", tone = "sun" }) {
    const c = { sun: "bg-sun/80", sky: "bg-sky/60", coral: "bg-coral/60", brand: "bg-brand/50" }[tone];
    return <span aria-hidden="true" className={`absolute h-6 w-20 ${c} shadow-sm ${className}`} />;
}
