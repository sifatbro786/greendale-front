import { CalendarDays, ClipboardList, Download, FileSearch, ScrollText } from "lucide-react";
import Link from "next/link";

import PageHeader from "@/components/site/PageHeader";
import Photo from "@/components/ui/Photo";
import { img } from "@/content/media";
import { getDownloads } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const metadata = {
    title: "Student Corner",
    description: "Class routines, syllabus, exam schedules and online results for Greendale students and guardians.",
    alternates: { canonical: "/student-corner" },
};

const kinds = [
    { kind: "routine", title: "Class Routine", icon: CalendarDays, tone: "bg-coral-soft text-coral" },
    { kind: "syllabus", title: "Syllabus", icon: ScrollText, tone: "bg-sky-soft text-sky" },
    { kind: "exam-schedule", title: "Exam Schedule", icon: ClipboardList, tone: "bg-sun-soft text-[#9a7400]" },
];

export default async function StudentCornerPage() {
    const downloads = await getDownloads();
    return (
        <>
            <PageHeader title="Student Corner" summary="Routines, syllabus, exam schedules and results, all in one place." tone="sky" crumbs={[{ label: "Student Corner" }]} />
            <div className="container-x space-y-14 py-14 lg:py-20">
                <div className="grid gap-4 md:grid-cols-3">
                    {kinds.map(({ kind, title, icon: Icon, tone }) => {
                        const items = downloads.filter((d) => d.kind === kind);
                        return (
                            <section key={kind} className="rounded-[1.25rem] border border-line bg-white p-6">
                                <span className={`grid size-12 place-items-center rounded-2xl ${tone}`}>
                                    <Icon className="size-6" aria-hidden="true" />
                                </span>
                                <h2 className="mt-4 text-xl font-semibold text-ink">{title}</h2>
                                {items.length ? (
                                    <ul className="mt-3 space-y-2">
                                        {items.map((d) => (
                                            <li key={d.id}>
                                                <a href={d.url} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-[15px] hover:bg-paper" target="_blank" rel="noopener noreferrer">
                                                    <span>
                                                        <span className="block font-medium text-ink">{d.title}</span>
                                                        <span className="text-[13px] text-ink-soft">{formatDate(d.publishedAt)}</span>
                                                    </span>
                                                    <Download className="size-4 text-brand" aria-hidden="true" />
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="mt-2 text-[15px] text-ink-soft">Will be published here by the office.</p>
                                )}
                            </section>
                        );
                    })}
                </div>

                <Link href="/result" className="group grid items-center gap-6 overflow-hidden rounded-[1.5rem] bg-brand p-6 text-white sm:grid-cols-[auto_1fr_auto] sm:p-8">
                    <span className="grid size-14 place-items-center rounded-2xl bg-white/15">
                        <FileSearch className="size-7" aria-hidden="true" />
                    </span>
                    <span>
                        <span className="block text-2xl font-semibold">Online Result</span>
                        <span className="mt-1 block text-white/75">Search a result with class, roll, exam and date of birth.</span>
                    </span>
                    <span className="btn-sun w-max">Check result</span>
                </Link>

                <section className="grid items-center gap-8 lg:grid-cols-[1fr_1.2fr]">
                    <div>
                        <h2 className="h-section">Practice at home</h2>
                        <p className="mt-3 text-[16.5px] leading-relaxed text-ink-soft">
                            A few worksheets from class. Print them, or simply read the phonics sentences aloud together.
                        </p>
                    </div>
                    <ul className="grid grid-cols-3 gap-3">
                        {[img.wsPhonics, img.wsIsAmAre, img.wsVerbs].map((w) => (
                            <li key={w.src}>
                                <a href={w.src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border-4 border-white bg-white shadow-[0_16px_32px_-18px_rgba(21,36,27,.5)] transition-transform hover:-translate-y-1">
                                    <Photo image={w} sizes="(min-width:1024px) 220px, 33vw" className="h-auto w-full" />
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </>
    );
}
