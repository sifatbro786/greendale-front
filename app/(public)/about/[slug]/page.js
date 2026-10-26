import { Suspense } from "react";
import { notFound } from "next/navigation";
import PageSkeleton from "@/components/site/PageSkeleton";

import HelpStrip from "@/components/site/HelpStrip";
import PageHeader from "@/components/site/PageHeader";
import RichText from "@/components/site/RichText";
import SideNav from "@/components/site/SideNav";
import LiteYouTube from "@/components/ui/LiteYouTube";
import { navigation, school } from "@/config/school";
import { getPage, getPagesBySection } from "@/lib/data";

export async function generateStaticParams() {
    const pages = await getPagesBySection("about");
    return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const page = await getPage("about", slug);
    if (!page) return {};
    return {
        title: page.title,
        description: page.summary,
        alternates: { canonical: `/about/${slug}` },
        openGraph: page.cover ? { images: [page.cover.src] } : undefined,
    };
}

/** Params are read inside <Suspense> so the shared App Shell stays URL-independent (instant navigation). */
export default function AboutPage({ params }) {
    return (
        <Suspense fallback={<PageSkeleton variant="page" />}>
            <AboutContent params={params} />
        </Suspense>
    );
}

async function AboutContent({ params }) {
    const { slug } = await params;
    const page = await getPage("about", slug);
    if (!page) notFound();

    const aboutNav = navigation.find((n) => n.label === "About")?.children ?? [];
    const isChairman = slug === "chairman-message";

    return (
        <>
            <PageHeader title={page.title} summary={page.summary} image={page.cover} crumbs={[{ label: "About" }, { label: page.title }]} />
            <div className="container-x grid grid-cols-1 gap-12 py-14 lg:grid-cols-[240px_minmax(0,1fr)] lg:py-20">
                <SideNav title="About Greendale" items={aboutNav} current={`/about/${slug}`} />
                <article className="max-w-3xl">
                    {isChairman && (
                        <div className="mb-10 rounded-[1.4rem] bg-white p-2 shadow-[0_24px_50px_-28px_rgba(21,36,27,.45)]">
                            <LiteYouTube id={school.videos.chairmanTalk.id} title={school.videos.chairmanTalk.title} className="rounded-[1rem]" />
                        </div>
                    )}
                    <RichText html={page.bodyHtml} />
                    <HelpStrip className="mt-14" />
                </article>
            </div>
        </>
    );
}
