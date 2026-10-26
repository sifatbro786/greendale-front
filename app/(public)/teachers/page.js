import HelpStrip from "@/components/site/HelpStrip";
import PageHeader from "@/components/site/PageHeader";
import Photo from "@/components/ui/Photo";
import { img } from "@/content/media";
import { getStaff } from "@/lib/data";

export const metadata = {
    title: "Teachers & Staff",
    description: "Meet the highly qualified and experienced teachers of Greendale English Version School.",
    alternates: { canonical: "/teachers" },
};

export default async function TeachersPage() {
    const staff = await getStaff();
    const groups = [
        { key: "teacher", title: "Teachers" },
        { key: "office", title: "Office staff" },
    ];

    return (
        <>
            <PageHeader
                title="Teachers & Staff"
                summary="Highly qualified and experienced teachers who know every child by name."
                image={img.classGroup}
                tone="coral"
                crumbs={[{ label: "Teachers & Staff" }]}
            />
            <div className="container-x py-14 lg:py-20">
                {staff.length ? (
                    groups.map((g) => {
                        const list = staff.filter((s) => s.group === g.key);
                        if (!list.length) return null;
                        return (
                            <section key={g.key} className="mb-14">
                                <h2 className="text-2xl font-semibold text-ink">{g.title}</h2>
                                <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                    {list.map((s) => (
                                        <li key={s.id} className="overflow-hidden rounded-[1.25rem] border border-line bg-white">
                                            <div className="relative aspect-[4/5] bg-brand-soft">
                                                {s.photo ? (
                                                    <Photo image={{ src: s.photo, alt: s.name }} fill sizes="(min-width:1024px) 280px, 50vw" />
                                                ) : (
                                                    <span className="absolute inset-0 grid place-items-center text-4xl font-semibold text-brand/40">
                                                        {s.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <p className="font-semibold text-ink">{s.name}</p>
                                                <p className="text-sm text-ink-soft">{s.designation}</p>
                                                {s.qualification && <p className="mt-1 text-[13px] text-ink-soft">{s.qualification}</p>}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        );
                    })
                ) : (
                    <div className="grid items-center gap-10 rounded-[1.5rem] bg-white p-6 sm:p-10 lg:grid-cols-2">
                        <div className="relative aspect-[16/9] overflow-hidden rounded-[1.25rem]">
                            <Photo image={img.classroomSmiles} fill sizes="(min-width:1024px) 520px, 100vw" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-ink">Teacher profiles are coming soon</h2>
                            <p className="mt-3 text-[16px] leading-relaxed text-ink-soft">
                                We are preparing photos and introductions of our teachers. Meanwhile, you are always welcome to visit the campus and
                                meet them in person.
                            </p>
                        </div>
                    </div>
                )}
                <HelpStrip className="mt-14" />
            </div>
        </>
    );
}
