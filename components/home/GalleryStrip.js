import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { img, video } from "@/content/media";

import Photo from "../ui/Photo";
import SectionHeading from "../ui/SectionHeading";
import VideoPlayer from "../ui/VideoPlayer";

export default function GalleryStrip() {
    return (
        <section className="bg-white py-20 sm:py-28" aria-labelledby="gallery-title">
            <div className="container-x">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <SectionHeading eyebrow="Photo & video gallery" title={<span id="gallery-title">Moments we love</span>} />
                    <Link href="/gallery" className="btn-primary">
                        Open gallery <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                </div>

                <div className="mt-12 grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] sm:gap-4 lg:grid-cols-4">
                    <div className="col-span-2 row-span-2 overflow-hidden rounded-[1.25rem]">
                        <VideoPlayer src={video.dance.src} poster={video.dance.poster} title="Little dancers on stage" fill />
                    </div>
                    <Tile image={img.artStage} sizes="(min-width:1024px) 300px, 50vw" />
                    <Tile image={img.scienceProject} sizes="(min-width:1024px) 300px, 50vw" />
                    <Tile image={img.cultural} className="col-span-2 lg:col-span-1" sizes="(min-width:1024px) 300px, 100vw" />
                    <Tile image={img.classroomSmiles} sizes="(min-width:1024px) 300px, 50vw" className="hidden lg:block" />
                </div>
            </div>
        </section>
    );
}

function Tile({ image, className = "", sizes }) {
    return (
        <Link href="/gallery" className={`group relative block overflow-hidden rounded-[1.25rem] ${className}`}>
            <Photo image={image} fill ratio={1.2} sizes={sizes} className="transition-transform duration-700 group-hover:scale-105" />
        </Link>
    );
}
