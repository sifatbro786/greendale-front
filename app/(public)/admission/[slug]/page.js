import { Suspense } from "react";
import { CheckCircle2, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageSkeleton from "@/components/site/PageSkeleton";

import HelpStrip from "@/components/site/HelpStrip";
import PageHeader from "@/components/site/PageHeader";
import RichText from "@/components/site/RichText";
import SideNav from "@/components/site/SideNav";
import Photo from "@/components/ui/Photo";
import { navigation } from "@/config/school";
import { img } from "@/content/media";
import { getAdmissionGuide, getClasses, getNotices, getPage } from "@/lib/data";
import { formatDate } from "@/lib/format";

const SLUGS = ["information", "notices"];

export function generateStaticParams() {
    return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    if (slug === "notices") return { title: "Admission Notices", alternates: { canonical: "/admission/notices" } };
    const page = await getPage("admission", slug);
    if (!page) return {};
    return { title: page.title, description: page.summary, alternates: { canonical: `/admission/${slug}` } };
}

/** Params are read inside <Suspense> so the shared App Shell stays URL-independent (instant navigation). */
export default function AdmissionPage({ params }) {
    return (
        <Suspense fallback={<PageSkeleton variant="page" />}>
            <AdmissionContent params={params} />
        </Suspense>
    );
}

async function AdmissionContent({ params }) {
    const { slug } = await params;
    if (!SLUGS.includes(slug)) notFound();
    const nav = navigation.find((n) => n.label === "Admission")?.children ?? [];

    if (slug === "notices") {
        const notices = await getNotices({ category: "admission" });
        return (
            <>
                <PageHeader title="Admission Notices" summary="Latest admission circulars and updates from the office." tone="sun" crumbs={[{ label: "Admission" }, { label: "Notices" }]} />
                <div className="container-x grid grid-cols-1 gap-12 py-14 lg:grid-cols-[240px_minmax(0,1fr)] lg:py-20">
                    <SideNav title="Admission" items={nav} current="/admission/notices" />
                    <div>
                        {notices.length ? (
                            <ul className="divide-y divide-line rounded-[1.25rem] border border-line bg-white">
                                {notices.map((n) => (
                                    <li key={n.id}>
                                        <Link href={`/notices/${n.slug}`} className="flex items-start gap-4 p-5 hover:bg-paper">
                                            <FileText className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                                            <span>
                                                <span className="block font-semibold text-ink">{n.title}</span>
                                                <time dateTime={n.publishedAt} className="text-sm text-ink-soft">{formatDate(n.publishedAt)}</time>
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-ink-soft">No admission notices right now.</p>
                        )}
                        <HelpStrip className="mt-12" />
                    </div>
                </div>
            </>
        );
    }

    const [page, guide, classes] = await Promise.all([getPage("admission", slug), getAdmissionGuide(), getClasses()]);
    if (!page) notFound();

    return (
        <>
            <PageHeader title={page.title} summary={page.summary} image={page.cover} tone="sun" crumbs={[{ label: "Admission" }, { label: page.title }]} />
            <div className="container-x grid grid-cols-1 gap-12 py-14 lg:grid-cols-[240px_minmax(0,1fr)] lg:py-20">
                <SideNav title="Admission" items={nav} current={`/admission/${slug}`} />
                <div className="min-w-0 space-y-14">
                    <RichText html={page.bodyHtml} className="max-w-3xl" />

                    <section aria-labelledby="steps">
                        <h2 id="steps" className="text-2xl font-semibold text-ink">How to apply</h2>
                        <ol className="mt-6 grid gap-4 sm:grid-cols-2">
                            {guide.steps.map((s, i) => (
                                <li key={s.title} className="relative rounded-[1.25rem] border border-line bg-white p-6">
                                    <span className="text-4xl font-semibold text-sun">{String(i + 1).padStart(2, "0")}</span>
                                    <p className="mt-2 text-lg font-semibold text-ink">{s.title}</p>
                                    <p className="mt-1 text-[15px] text-ink-soft">{s.text}</p>
                                </li>
                            ))}
                        </ol>
                    </section>

                    <section aria-labelledby="ages" className="grid gap-8 lg:grid-cols-2">
                        <div>
                            <h2 id="ages" className="text-2xl font-semibold text-ink">Classes & age guidance</h2>
                            <ul className="mt-5 divide-y divide-line rounded-[1.25rem] border border-line bg-white">
                                {classes.map((c) => (
                                    <li key={c.id} className="flex items-center justify-between px-5 py-3.5">
                                        <span className="font-medium text-ink">{c.name}</span>
                                        <span className="text-[15px] text-ink-soft">{c.ageHint}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-ink">Documents to bring</h2>
                            <ul className="mt-5 space-y-3">
                                {guide.documents.map((d) => (
                                    <li key={d} className="flex gap-3 text-[15.5px] text-ink">
                                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                                        {d}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8 rounded-[1.25rem] bg-coral-soft p-5">
                                <p className="font-semibold text-ink">Admission form</p>
                                <p className="mt-1 text-[15px] text-ink-soft">Collect the form from the school office. A downloadable form will be added here soon.</p>
                            </div>
                        </div>
                    </section>

                    <section aria-labelledby="uniform" className="grid items-center gap-8 rounded-[1.5rem] bg-white p-6 sm:grid-cols-[220px_1fr] sm:p-8">
                        <div className="relative mx-auto aspect-[4/5] w-48 overflow-hidden rounded-2xl sm:w-full">
                            <Photo image={img.dressCode} fill ratio={4 / 5} sizes="220px" />
                        </div>
                        <div>
                            <h2 id="uniform" className="text-2xl font-semibold text-ink">School uniform</h2>
                            <p className="mt-3 text-[15.5px] leading-relaxed text-ink-soft">
                                Cream shirt with the green Greendale collar and badge, with dark green bottoms, plus the school ID card. The office will
                                guide you on where to get the uniform.
                            </p>
                        </div>
                    </section>

                    <HelpStrip title="Ready to visit? Call or WhatsApp the office to set a time." />
                </div>
            </div>
        </>
    );
}
