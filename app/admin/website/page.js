import { ExternalLink, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import DataTable from "@/components/dash/DataTable";
import DownloadsManager from "@/components/dash/cms/DownloadsManager";
import FacilitiesManager from "@/components/dash/cms/FacilitiesManager";
import MessageActions from "@/components/dash/cms/MessageActions";
import VideosManager from "@/components/dash/cms/VideosManager";
import DemoButton from "@/components/dash/DemoButton";
import Tabs from "@/components/dash/Tabs";
import { Badge, Card, PageHead } from "@/components/dash/ui";
import { requirePermission } from "@/lib/auth/session";
import { cmsOverview } from "@/lib/dashboard/comms";
import { formatDate, formatDateTime } from "@/lib/format";
import { isDemo } from "@/lib/mode";

const TABS = ["notices", "news", "gallery", "videos", "pages", "facilities", "downloads", "messages"];
const STATUS_BADGE = { Published: "green", Scheduled: "blue", Draft: "gray" };

export const metadata = { title: "Website" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function WebsitePage({ searchParams }) {
    await requirePermission("website.manage");
    const { tab } = await searchParams;
    const cms = await cmsOverview();
    const unread = cms.messages.filter((m) => !m.replied).length;
    return (
        <>
            <PageHead
                title="Website content"
                description="Everything on the public website. Saving here updates the site within seconds (no developer needed)."
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Website" }]}
                actions={
                    <Link href="/" target="_blank" className="btn-ghost min-h-10 text-[14px]">
                        <ExternalLink className="size-4" aria-hidden="true" /> Open website
                    </Link>
                }
            />
            <Card>
                <Tabs
                    initial={TABS.includes(tab) ? tab : undefined}
                    tabs={[
                        { id: "notices", label: `Notices (${cms.notices.length})` },
                        { id: "news", label: `News & events (${cms.news.length})` },
                        { id: "gallery", label: `Gallery (${cms.albums.length})` },
                        { id: "videos", label: `Videos (${cms.videos.length})` },
                        { id: "pages", label: `Pages (${cms.pages.length})` },
                        { id: "facilities", label: `Facilities (${cms.facilities.length})` },
                        { id: "downloads", label: `Downloads (${cms.downloads.length})` },
                        { id: "messages", label: `Messages${unread ? ` · ${unread} new` : ""}` },
                    ]}
                    panels={{
                        notices: (
                            <div className="-mx-5 -mb-5">
                                <div className="flex flex-wrap items-center justify-between gap-2 px-5 pb-3">
                                    <p className="text-[13.5px] text-ink-soft">Website notices are written from Notices (audience “Website”).</p>
                                    {isDemo && (
                                        <DemoButton className="btn-primary min-h-10 text-[14px]">
                                            <Plus className="size-4" aria-hidden="true" /> New website notice
                                        </DemoButton>
                                    )}
                                </div>
                                <DataTable
                                    rows={cms.notices}
                                    columns={[
                                        { key: "title", label: "Title", href: "/notices/{slug}" },
                                        { key: "category", label: "Category" },
                                        { key: "publishedAt", label: "Published", type: "date" },
                                        { key: "status", label: "Status", type: "badge", badgeTones: STATUS_BADGE },
                                    ]}
                                    searchKeys={["title"]}
                                />
                            </div>
                        ),
                        news: (
                            <>
                                <div className="mb-4 flex justify-end">
                                    <Link href="/admin/website/news/new" className="btn-primary min-h-10 text-[14px]">
                                        <Plus className="size-4" aria-hidden="true" /> New post
                                    </Link>
                                </div>
                                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    {cms.news.map((n) => (
                                        <li key={n.id} className="group relative overflow-hidden rounded-xl border border-line">
                                            <div className="relative aspect-[16/10] bg-paper">
                                                {n.cover && <Image src={n.cover} alt="" fill sizes="300px" className="object-cover" />}
                                                {n.status !== "Published" && (
                                                    <Badge tone={STATUS_BADGE[n.status]} className="absolute top-2 left-2">
                                                        {n.status}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="p-3.5">
                                                <p className="text-[12.5px] text-ink-soft">{n.publishedAt ? formatDate(n.publishedAt) : "Not published"}</p>
                                                <Link
                                                    href={`/admin/website/news/${n.id}`}
                                                    className="mt-1 line-clamp-2 block font-medium text-ink after:absolute after:inset-0 group-hover:text-brand-deep"
                                                >
                                                    {n.title}
                                                </Link>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ),
                        gallery: (
                            <>
                                <div className="mb-4 flex justify-end">
                                    <Link href="/admin/website/gallery/new" className="btn-primary min-h-10 text-[14px]">
                                        <Plus className="size-4" aria-hidden="true" /> New album
                                    </Link>
                                </div>
                                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    {cms.albums.map((a) => (
                                        <li key={a.id} className="group relative overflow-hidden rounded-xl border border-line">
                                            <div className="relative aspect-[4/3] bg-paper">
                                                {a.cover && <Image src={a.cover} alt="" fill sizes="300px" className="object-cover" />}
                                                <span className="absolute top-2 left-2 rounded-full bg-white/95 px-2 py-0.5 text-[12px] font-semibold">{a.count} photos</span>
                                                {!a.isPublished && <Badge className="absolute top-2 right-2">Hidden</Badge>}
                                            </div>
                                            <div className="flex items-center justify-between gap-2 p-3.5">
                                                <Link href={`/admin/website/gallery/${a.id}`} className="font-medium text-ink after:absolute after:inset-0 group-hover:text-brand-deep">
                                                    {a.title}
                                                </Link>
                                                <span className="text-[13px] font-semibold text-brand-deep">Manage</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ),
                        videos: <VideosManager key={JSON.stringify(cms.videos)} videos={cms.videos} demo={isDemo} />,
                        facilities: <FacilitiesManager key={JSON.stringify(cms.facilities)} facilities={cms.facilities} demo={isDemo} />,
                        downloads: <DownloadsManager key={JSON.stringify(cms.downloads)} downloads={cms.downloads} classOptions={cms.classOptions} demo={isDemo} />,
                        pages: (
                            <ul className="divide-y divide-line">
                                {cms.pages.map((p) => (
                                    <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                                        <Badge>{p.section}</Badge>
                                        <span className="flex-1 font-medium text-ink">{p.title}</span>
                                        {p.isPublished === false && <Badge>Hidden</Badge>}
                                        <span className="text-[13px] text-ink-soft">Updated {formatDate(p.updatedAt)}</span>
                                        <Link href={p.href} target="_blank" className="text-[13.5px] font-semibold text-brand-deep">
                                            View
                                        </Link>
                                        <Link href={`/admin/website/pages/${p.id}`} className="text-[13.5px] font-semibold text-brand-deep">
                                            Edit
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ),
                        messages: (
                            <ul className="divide-y divide-line">
                                {cms.messages.map((m) => (
                                    <li key={m.id} className="py-4">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-ink">{m.name}</span>
                                            <span className="text-[13px] text-ink-soft">
                                                {m.phone} · {formatDateTime(m.receivedAt)}
                                            </span>
                                            <Badge tone={m.replied ? "green" : "yellow"}>{m.replied ? "Replied" : "New"}</Badge>
                                            <Badge tone="blue">{m.subject}</Badge>
                                        </div>
                                        <p className="mt-1.5 text-[15px] whitespace-pre-line text-ink">{m.message}</p>
                                        {m.email && (
                                            <a href={`mailto:${m.email}`} className="mt-1 block text-[13.5px] text-brand-deep underline underline-offset-2">
                                                {m.email}
                                            </a>
                                        )}
                                        <MessageActions id={m.id} replied={m.replied} demo={isDemo} />
                                    </li>
                                ))}
                            </ul>
                        ),
                    }}
                />
            </Card>
        </>
    );
}
