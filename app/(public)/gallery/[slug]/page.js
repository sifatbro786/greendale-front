import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageSkeleton from "@/components/site/PageSkeleton";

import Lightbox from "@/components/site/Lightbox";
import { getAlbum, getAlbums } from "@/lib/data";
import { formatDate } from "@/lib/format";

export async function generateStaticParams() {
    const albums = await getAlbums();
    return albums.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const a = await getAlbum(slug);
    if (!a) return {};
    return { title: a.title, description: a.description, alternates: { canonical: `/gallery/${slug}` }, openGraph: { images: [a.cover.src] } };
}

/** Params are read inside <Suspense> so the shared App Shell stays URL-independent (instant navigation). */
export default function AlbumPage({ params }) {
    return (
        <Suspense fallback={<PageSkeleton variant="detail" />}>
            <AlbumContent params={params} />
        </Suspense>
    );
}

async function AlbumContent({ params }) {
    const { slug } = await params;
    const a = await getAlbum(slug);
    if (!a) notFound();
    return (
        <div className="container-x py-12 lg:py-16">
            <Link href="/gallery" className="inline-flex items-center gap-2 text-[15px] font-medium text-brand-deep hover:text-brand">
                <ArrowLeft className="size-4" aria-hidden="true" /> Gallery
            </Link>
            <div className="mt-6 mb-10 max-w-3xl">
                {a.date && <p className="text-[15px] text-ink-soft">{formatDate(a.date, { month: "long", year: "numeric" })}</p>}
                <h1 className="h-display mt-2 text-ink">{a.title}</h1>
                {a.description && <p className="mt-3 text-lg text-ink-soft">{a.description}</p>}
            </div>
            <Lightbox images={a.images} />
        </div>
    );
}
