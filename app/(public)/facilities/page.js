import HelpStrip from "@/components/site/HelpStrip";
import PageHeader from "@/components/site/PageHeader";
import Photo from "@/components/ui/Photo";
import { img } from "@/content/media";
import { getFacilities } from "@/lib/data";
import { toneClasses } from "@/lib/format";

export const metadata = {
    title: "Facilities",
    description: "AC classrooms, a kids' play zone, colourful learning walls and free Arabic learning at Greendale.",
    alternates: { canonical: "/facilities" },
};

export default async function FacilitiesPage() {
    const facilities = await getFacilities();
    return (
        <>
            <PageHeader title="Facilities" summary="A comfortable, colourful campus made for little learners." image={img.playZone} crumbs={[{ label: "Facilities" }]} />
            <div className="container-x py-14 lg:py-20">
                <ul className="space-y-6">
                    {facilities.map((f, i) => {
                        const t = toneClasses[f.tone];
                        return (
                            <li key={f.id} className={`grid items-center gap-6 overflow-hidden rounded-[1.5rem] ${t.bg} md:grid-cols-2`}>
                                <div className={`relative aspect-[16/10] md:h-full ${i % 2 ? "md:order-2" : ""}`}>
                                    <Photo image={f.image} fill ratio={1.1} sizes="(min-width:768px) 600px, 100vw" />
                                </div>
                                <div className="p-6 sm:p-10">
                                    <span className={`text-sm font-semibold tabular-nums ${t.text}`}>{String(i + 1).padStart(2, "0")}</span>
                                    <h2 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">{f.title}</h2>
                                    <p className="mt-3 max-w-md text-[16.5px] leading-relaxed text-ink-soft">{f.text}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
                <HelpStrip className="mt-14" title="The best way to see the campus is to visit. Call us to set a time." />
            </div>
        </>
    );
}
