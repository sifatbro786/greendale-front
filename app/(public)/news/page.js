import Link from "next/link";

import PageHeader from "@/components/site/PageHeader";
import Photo from "@/components/ui/Photo";
import { getNews } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const metadata = {
    title: "News & Events",
    description: "Programmes, celebrations and achievements at Greendale English Version School.",
    alternates: { canonical: "/news" },
};

export default async function NewsPage() {
    const posts = await getNews();
    const [lead, ...rest] = posts;
    return (
        <>
            <PageHeader title="News & Events" summary="Programmes, celebrations and proud moments from Greendale." tone="coral" crumbs={[{ label: "News & Events" }]} />
            <div className="container-x py-14 lg:py-20">
                {lead && (
                    <Link href={`/news/${lead.slug}`} className="group grid overflow-hidden rounded-[1.5rem] border border-line bg-white lg:grid-cols-[1.3fr_1fr]">
                        <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[360px]">
                            <Photo image={lead.cover} fill ratio={16 / 10} sizes="(min-width:1024px) 900px, 100vw" priority className="transition-transform duration-700 group-hover:scale-[1.03]" />
                        </div>
                        <div className="flex flex-col justify-center p-6 sm:p-10">
                            <time dateTime={lead.publishedAt} className="text-[14px] text-ink-soft">{formatDate(lead.publishedAt)}</time>
                            <h2 className="mt-2 text-2xl leading-snug font-semibold text-ink group-hover:text-brand-deep sm:text-3xl">{lead.title}</h2>
                            <p className="mt-3 text-[16px] leading-relaxed text-ink-soft">{lead.excerpt}</p>
                            <span className="mt-6 font-semibold text-brand-deep">Read story →</span>
                        </div>
                    </Link>
                )}
                <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {rest.map((p) => (
                        <li key={p.id}>
                            <Link href={`/news/${p.slug}`} className="group block">
                                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem]">
                                    <Photo image={p.cover} fill ratio={4 / 3} sizes="(min-width:1024px) 380px, (min-width:640px) 50vw, 100vw" className="transition-transform duration-700 group-hover:scale-105" />
                                </div>
                                <time dateTime={p.publishedAt} className="mt-4 block text-[14px] text-ink-soft">{formatDate(p.publishedAt)}</time>
                                <h2 className="mt-1 text-lg leading-snug font-semibold text-ink group-hover:text-brand-deep">{p.title}</h2>
                                <p className="mt-1.5 line-clamp-2 text-[15px] text-ink-soft">{p.excerpt}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
