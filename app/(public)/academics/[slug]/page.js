import { Suspense } from "react";
import { notFound } from "next/navigation";
import PageSkeleton from "@/components/site/PageSkeleton";

import HelpStrip from "@/components/site/HelpStrip";
import PageHeader from "@/components/site/PageHeader";
import RichText from "@/components/site/RichText";
import SideNav from "@/components/site/SideNav";
import Photo from "@/components/ui/Photo";
import { navigation } from "@/config/school";
import { getClasses, getPage, getPagesBySection } from "@/lib/data";
import { toneClasses } from "@/lib/format";
import { img } from "@/content/media";

export async function generateStaticParams() {
    const pages = await getPagesBySection("academics");
    return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const page = await getPage("academics", slug);
    if (!page) return {};
    return { title: page.title, description: page.summary, alternates: { canonical: `/academics/${slug}` } };
}

/** Params are read inside <Suspense> so the shared App Shell stays URL-independent (instant navigation). */
export default function AcademicsPage({ params }) {
    return (
        <Suspense fallback={<PageSkeleton variant="page" />}>
            <AcademicsContent params={params} />
        </Suspense>
    );
}

async function AcademicsContent({ params }) {
    const { slug } = await params;
    const page = await getPage("academics", slug);
    if (!page) notFound();
    const nav = navigation.find((n) => n.label === "Academics")?.children ?? [];

    return (
        <>
            <PageHeader title={page.title} summary={page.summary} image={page.cover} tone="sky" crumbs={[{ label: "Academics" }, { label: page.title }]} />
            <div className="container-x grid grid-cols-1 gap-12 py-14 lg:grid-cols-[240px_minmax(0,1fr)] lg:py-20">
                <SideNav title="Academics" items={nav} current={`/academics/${slug}`} />
                <article className="min-w-0">
                    <RichText html={page.bodyHtml} className="max-w-3xl" />
                    {slug === "classes" && <ClassList />}
                    {slug === "curriculum" && <Worksheets />}
                    {slug === "activities" && <ActivityPhotos />}
                    <HelpStrip className="mt-14" title={slug === "fees" ? "Call the office for the current fee chart." : undefined} />
                </article>
            </div>
        </>
    );
}

async function ClassList() {
    const classes = await getClasses();
    const groups = [
        { id: "early", title: "Early Years", note: "Play Group, Nursery and KG", list: classes.filter((c) => c.stage === "early") },
        { id: "primary", title: "Primary", note: "Class I to Class V", list: classes.filter((c) => c.stage === "primary") },
    ];
    return (
        <div className="mt-10 space-y-14">
            {groups.map((g) => (
                <section key={g.id} id={g.id} className="scroll-mt-28">
                    <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                        <h2 className="text-2xl font-semibold text-ink">{g.title}</h2>
                        <p className="text-[15px] text-ink-soft">{g.note}</p>
                    </div>
                    <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                        {g.list.map((c) => {
                            const t = toneClasses[c.tone];
                            return (
                                <li key={c.id} id={c.slug} className={`scroll-mt-28 rounded-[1.25rem] p-6 ${t.bg}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-xl font-semibold text-ink">{c.name}</h3>
                                        <span className="rounded-full bg-white px-2.5 py-1 text-[12.5px] font-medium text-ink-soft">{c.ageHint}</span>
                                    </div>
                                    <p className="mt-2 text-[15.5px] leading-relaxed text-ink-soft">{c.summary}</p>
                                    <ul className="mt-4 flex flex-wrap gap-1.5">
                                        {c.focus.map((f) => (
                                            <li key={f} className="rounded-md bg-white/80 px-2.5 py-1 text-[13px] font-medium text-ink">{f}</li>
                                        ))}
                                    </ul>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            ))}
            <p className="text-sm text-ink-soft">Age guidance is approximate. The office will help you find the right class for your child.</p>
        </div>
    );
}

function Worksheets() {
    const sheets = [img.wsPhonics, img.wsIsAmAre, img.wsVerbs];
    return (
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {sheets.map((s, i) => (
                <li key={s.src} className={`overflow-hidden rounded-lg border-4 border-white bg-white shadow-[0_18px_36px_-20px_rgba(21,36,27,.5)] ${i % 2 ? "rotate-1" : "-rotate-1"}`}>
                    <Photo image={s} sizes="(min-width:640px) 260px, 50vw" className="h-auto w-full" />
                </li>
            ))}
        </ul>
    );
}

function ActivityPhotos() {
    const photos = [img.artStage, img.scienceProject, img.cultural, img.birthdayCake];
    return (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {photos.map((p) => (
                <li key={p.src} className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem]">
                    <Photo image={p} fill sizes="(min-width:640px) 420px, 100vw" />
                </li>
            ))}
        </ul>
    );
}
