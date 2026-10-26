import { Suspense } from "react";
import { ArrowLeft, FileDown } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageSkeleton from "@/components/site/PageSkeleton";

import HelpStrip from "@/components/site/HelpStrip";
import RichText from "@/components/site/RichText";
import { getNotice, getNotices } from "@/lib/data";
import { formatDate, plainText } from "@/lib/format";

export async function generateStaticParams() {
    const notices = await getNotices({ limit: 200 });
    return notices.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const n = await getNotice(slug);
    if (!n) return {};
    return { title: n.title, description: n.excerpt || plainText(n.bodyHtml), alternates: { canonical: `/notices/${slug}` } };
}

/** Params are read inside <Suspense> so the shared App Shell stays URL-independent (instant navigation). */
export default function NoticePage({ params }) {
    return (
        <Suspense fallback={<PageSkeleton variant="detail" />}>
            <NoticeContent params={params} />
        </Suspense>
    );
}

async function NoticeContent({ params }) {
    const { slug } = await params;
    const n = await getNotice(slug);
    if (!n) notFound();

    return (
        <div className="container-x max-w-3xl py-12 lg:py-16">
            <Link href="/notices" className="inline-flex items-center gap-2 text-[15px] font-medium text-brand-deep hover:text-brand">
                <ArrowLeft className="size-4" aria-hidden="true" /> All notices
            </Link>
            <article className="relative mt-6 overflow-hidden rounded-[1.5rem] border border-line bg-white p-6 sm:p-10">
                <div className="absolute inset-x-0 top-0 h-1.5 bg-sun" aria-hidden="true" />
                <p className="flex flex-wrap items-center gap-2 text-[14px] text-ink-soft">
                    <time dateTime={n.publishedAt}>{formatDate(n.publishedAt, { day: "numeric", month: "long", year: "numeric" })}</time>
                    <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[12.5px] font-medium text-brand-deep capitalize">{n.category}</span>
                </p>
                <h1 className="mt-3 text-3xl leading-tight font-semibold text-ink sm:text-4xl">{n.title}</h1>
                {n.bodyHtml && <RichText html={n.bodyHtml} className="mt-6" />}
                {n.pdfUrl && (
                    <a href={n.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-8">
                        <FileDown className="size-4" aria-hidden="true" /> Download PDF
                    </a>
                )}
                <p className="mt-10 border-t border-line pt-5 text-[14px] text-ink-soft">— Office, Greendale English Version School</p>
            </article>
            <HelpStrip className="mt-10" />
        </div>
    );
}
