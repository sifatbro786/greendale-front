import Link from "next/link";

import PageHeader from "@/components/site/PageHeader";
import LiteYouTube from "@/components/ui/LiteYouTube";
import Photo from "@/components/ui/Photo";
import VideoPlayer from "@/components/ui/VideoPlayer";
import { img } from "@/content/media";
import { getAlbums, getVideos } from "@/lib/data";

export const metadata = {
    title: "Gallery",
    description: "Photos and videos from classrooms, celebrations, art exhibitions and events at Greendale.",
    alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
    const [albums, videos] = await Promise.all([getAlbums(), getVideos()]);
    const files = videos.filter((v) => v.kind === "file");
    const yt = videos.filter((v) => v.kind === "youtube");

    return (
        <>
            <PageHeader title="Gallery" summary="Albums and videos from everyday school life and special days." image={img.artWinners} tone="coral" crumbs={[{ label: "Gallery" }]} />
            <div className="container-x space-y-20 py-14 lg:py-20">
                <section aria-labelledby="albums">
                    <h2 id="albums" className="text-2xl font-semibold text-ink sm:text-3xl">Photo albums</h2>
                    <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {albums.map((a) => (
                            <li key={a.id}>
                                <Link href={`/gallery/${a.slug}`} className="group block">
                                    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem]">
                                        <Photo image={a.cover} fill ratio={4 / 5} sizes="(min-width:1024px) 290px, (min-width:640px) 50vw, 100vw" className="transition-transform duration-700 group-hover:scale-105" />
                                        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[12.5px] font-semibold text-ink">
                                            {a.images.length} photos
                                        </span>
                                    </div>
                                    <h3 className="mt-3 text-lg leading-snug font-semibold text-ink group-hover:text-brand-deep">{a.title}</h3>
                                    {a.description && <p className="mt-0.5 text-[15px] text-ink-soft">{a.description}</p>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>

                <section aria-labelledby="videos">
                    <h2 id="videos" className="text-2xl font-semibold text-ink sm:text-3xl">Videos</h2>
                    <ul className="mt-6 grid gap-5 md:grid-cols-2">
                        {yt.map((v) => (
                            <li key={v.id}>
                                <LiteYouTube id={v.youtubeId} title={v.title} className="rounded-[1.25rem]" />
                            </li>
                        ))}
                        {files
                            .filter((v) => v.orientation === "landscape")
                            .map((v) => (
                                <li key={v.id}>
                                    <VideoPlayer src={v.src} poster={v.poster} title={v.title} className="rounded-[1.25rem]" />
                                </li>
                            ))}
                    </ul>
                    <ul className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-4">
                        {files
                            .filter((v) => v.orientation === "portrait")
                            .map((v) => (
                                <li key={v.id}>
                                    <VideoPlayer src={v.src} poster={v.poster} title={v.title} portrait className="rounded-[1.25rem]" />
                                </li>
                            ))}
                    </ul>
                </section>
            </div>
        </>
    );
}
