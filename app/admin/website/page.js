import { ExternalLink, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import DataTable from "@/components/dash/DataTable";
import DemoButton from "@/components/dash/DemoButton";
import Tabs from "@/components/dash/Tabs";
import { Badge, Card, PageHead } from "@/components/dash/ui";
import { requirePermission } from "@/lib/auth/session";
import { cmsOverview } from "@/lib/dashboard/comms";
import { formatDate, formatDateTime } from "@/lib/format";

export const metadata = { title: "Website" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function WebsitePage() {
    await requirePermission("website.manage");
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
                    tabs={[
                        { id: "notices", label: `Notices (${cms.notices.length})` },
                        { id: "news", label: `News & events (${cms.news.length})` },
                        { id: "gallery", label: `Gallery (${cms.albums.length})` },
                        { id: "pages", label: `Pages (${cms.pages.length})` },
                        { id: "messages", label: `Messages${unread ? ` · ${unread} new` : ""}` },
                    ]}
                    panels={{
                        notices: (
                            <div className="-mx-5 -mb-5">
                                <div className="flex justify-end px-5 pb-3">
                                    <DemoButton className="btn-primary min-h-10 text-[14px]">
                                        <Plus className="size-4" aria-hidden="true" /> New website notice
                                    </DemoButton>
                                </div>
                                <DataTable
                                    rows={cms.notices}
                                    columns={[
                                        { key: "title", label: "Title", href: "/notices/{slug}" },
                                        { key: "category", label: "Category" },
                                        { key: "publishedAt", label: "Published", type: "date" },
                                        { key: "status", label: "Status", type: "badge", badgeTones: { Published: "green" } },
                                    ]}
                                    searchKeys={["title"]}
                                />
                            </div>
                        ),
                        news: (
                            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {cms.news.map((n) => (
                                    <li key={n.id} className="overflow-hidden rounded-xl border border-line">
                                        <div className="relative aspect-[16/10]">
                                            <Image src={n.cover} alt="" fill sizes="300px" className="object-cover" />
                                        </div>
                                        <div className="p-3.5">
                                            <p className="text-[12.5px] text-ink-soft">{formatDate(n.publishedAt)}</p>
                                            <Link href={`/news/${n.slug}`} target="_blank" className="mt-1 line-clamp-2 block font-medium text-ink hover:text-brand-deep">
                                                {n.title}
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ),
                        gallery: (
                            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {cms.albums.map((a) => (
                                    <li key={a.id} className="overflow-hidden rounded-xl border border-line">
                                        <div className="relative aspect-[4/3]">
                                            <Image src={a.cover} alt="" fill sizes="300px" className="object-cover" />
                                            <span className="absolute top-2 left-2 rounded-full bg-white/95 px-2 py-0.5 text-[12px] font-semibold">{a.count} photos</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 p-3.5">
                                            <p className="font-medium text-ink">{a.title}</p>
                                            <DemoButton className="text-[13px] font-semibold text-brand-deep" title="Upload photos" message="Demo: upload up to 30 photos at once; they are checked, resized to WebP and added to the album.">
                                                Upload
                                            </DemoButton>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ),
                        pages: (
                            <ul className="divide-y divide-line">
                                {cms.pages.map((p) => (
                                    <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                                        <Badge>{p.section}</Badge>
                                        <span className="flex-1 font-medium text-ink">{p.title}</span>
                                        <span className="text-[13px] text-ink-soft">Updated {formatDate(p.updatedAt)}</span>
                                        <Link href={p.href} target="_blank" className="text-[13.5px] font-semibold text-brand-deep">
                                            View
                                        </Link>
                                        <DemoButton className="text-[13.5px] font-semibold text-brand-deep">Edit</DemoButton>
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
                                        <p className="mt-1.5 text-[15px] text-ink">{m.message}</p>
                                        {!m.replied && (
                                            <DemoButton className="mt-2 text-[13.5px] font-semibold text-brand-deep" title="Marked as replied">
                                                Mark as replied
                                            </DemoButton>
                                        )}
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
