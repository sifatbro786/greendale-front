import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageSkeleton from "@/components/site/PageSkeleton";

import RichText from "@/components/site/RichText";
import Photo from "@/components/ui/Photo";
import { getNews, getNewsPost } from "@/lib/data";
import { formatDate } from "@/lib/format";

export async function generateStaticParams() {
    const posts = await getNews();
    return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const p = await getNewsPost(slug);
    if (!p) return {};
    return {
        title: p.title,
        description: p.excerpt,
        alternates: { canonical: `/news/${slug}` },
        openGraph: { type: "article", images: [p.cover.src], publishedTime: p.publishedAt },
    };
}

/** Params are read inside <Suspense> so the shared App Shell stays URL-independent (instant navigation). */
export default function NewsPostPage({ params }) {
    return (
        <Suspense fallback={<PageSkeleton variant="detail" />}>
            <NewsPostContent params={params} />
        </Suspense>
    );
}

async function NewsPostContent({ params }) {
    const { slug } = await params;
    const p = await getNewsPost(slug);
    if (!p) notFound();
    const more = (await getNews({ limit: 4 })).filter((x) => x.slug !== slug).slice(0, 3);

    return (
        <article className="pb-20">
            <div className="container-x max-w-4xl pt-10 sm:pt-14">
                <Link href="/news" className="inline-flex items-center gap-2 text-[15px] font-medium text-brand-deep hover:text-brand">
                    <ArrowLeft className="size-4" aria-hidden="true" /> News & Events
                </Link>
                <time dateTime={p.publishedAt} className="mt-8 block text-[15px] text-ink-soft">
                    {formatDate(p.publishedAt, { day: "numeric", month: "long", year: "numeric" })}
                </time>
                <h1 className="h-display mt-3 text-ink">{p.title}</h1>
                <p className="mt-4 text-xl leading-relaxed text-ink-soft">{p.excerpt}</p>
            </div>
            <div className="container-x mt-10 max-w-5xl">
                <div className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem]">
                    <Photo image={p.cover} fill ratio={16 / 9} sizes="(min-width:1024px) 1000px, 100vw" priority />
                </div>
            </div>
            <div className="container-x mt-10 max-w-3xl">
                <RichText html={p.bodyHtml} />
                {p.images?.length > 1 && (
                    <ul className="mt-10 grid gap-3 sm:grid-cols-2">
                        {p.images
                            .filter((i) => i.src !== p.cover.src)
                            .map((i) => (
                                <li key={i.src} className="relative aspect-[4/3] overflow-hidden rounded-[1.1rem]">
                                    <Photo image={i} fill ratio={4 / 3} sizes="(min-width:640px) 380px, 100vw" />
                                </li>
                            ))}
                    </ul>
                )}
                {p.albumSlug && (
                    <Link href={`/gallery/${p.albumSlug}`} className="btn-ghost mt-8">
                        See the full album
                    </Link>
                )}
            </div>

            {more.length > 0 && (
                <div className="container-x mt-20">
                    <h2 className="text-2xl font-semibold text-ink">More from Greendale</h2>
                    <ul className="mt-6 grid gap-6 sm:grid-cols-3">
                        {more.map((m) => (
                            <li key={m.id}>
                                <Link href={`/news/${m.slug}`} className="group block">
                                    <div className="relative aspect-[4/3] overflow-hidden rounded-[1.1rem]">
                                        <Photo image={m.cover} fill ratio={4 / 3} sizes="(min-width:640px) 380px, 100vw" />
                                    </div>
                                    <h3 className="mt-3 leading-snug font-semibold text-ink group-hover:text-brand-deep">{m.title}</h3>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </article>
    );
}
