import { school } from "@/config/school";

/** Static facts band (no count-up). Inset like the reference's stat band. */
export default function FactsBand() {
    const facts = [
        { big: "Play → V", text: "Eight classes, from first steps to the end of primary" },
        { big: school.eiin, text: "Our EIIN (Educational Institution Identification Number)" },
        { big: "Free", text: "Arabic learning included for every student" },
    ];
    return (
        <section className="container-x" aria-label="Key facts">
            <ul className="paper-grain grid overflow-hidden rounded-[1.5rem] bg-brand text-white sm:grid-cols-3">
                {facts.map((f) => (
                    <li key={f.text} className="border-white/20 px-7 py-7 not-last:border-b sm:not-last:border-r sm:not-last:border-b-0 sm:py-9">
                        <p className="text-3xl font-semibold tracking-tight sm:text-4xl">{f.big}</p>
                        <p className="mt-2 max-w-[17rem] text-[15px] leading-snug text-white/80">{f.text}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
}
