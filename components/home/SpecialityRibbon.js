import { school } from "@/config/school";

import { Sparkle } from "../ui/Decor";

/** Colourful slanted ribbon of the school's specialities (static text, CSS marquee). */
export default function SpecialityRibbon() {
    const items = [...school.specialities, ...school.specialities];
    const colors = ["text-sun", "text-[#9ee0b5]", "text-[#ffb39f]", "text-[#9fd6f5]"];
    return (
        <div className="relative z-10 -my-3 overflow-hidden py-6" aria-label="Our specialities">
            <div className="-rotate-[1.5deg] bg-ink py-3.5 shadow-lg">
                <ul className="flex w-max animate-marquee items-center gap-8">
                    {items.map((s, i) => (
                        <li key={i} className="flex items-center gap-8 text-[15px] font-semibold whitespace-nowrap text-white sm:text-lg" aria-hidden={i >= school.specialities.length ? true : undefined}>
                            {s}
                            <Sparkle className={`size-4 ${colors[i % colors.length]}`} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
