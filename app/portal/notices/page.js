import Link from "next/link";

import { Badge, Card, PageHead } from "@/components/dash/ui";
import { requireStudent } from "@/lib/auth/session";
import { portalNotices } from "@/lib/dashboard/comms";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Notices" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function PortalNotices() {
    const user = await requireStudent();
    const notices = await portalNotices(user.studentId);
    return (
        <>
            <PageHead title="Notices" description="School notices, notices for your class and website announcements." />
            <div className="grid gap-3">
                {notices.map((n) => (
                    <Card key={n.id}>
                        <div className="flex flex-wrap items-center gap-2">
                            {n.pinned && <Badge tone="yellow">Pinned</Badge>}
                            <Badge tone={n.scope === "Your class" ? "yellow" : n.scope === "Website" ? "gray" : "blue"}>{n.scope}</Badge>
                            <span className="text-[13px] text-ink-soft">{formatDate(n.publishedAt, { day: "numeric", month: "long", year: "numeric" })}</span>
                        </div>
                        <h2 className="mt-2 text-[17px] font-semibold text-ink">{n.title}</h2>
                        <p className="mt-1 text-[15px] text-ink-soft">{n.body}</p>
                        {n.slug && (
                            <Link href={`/notices/${n.slug}`} className="mt-2 inline-block text-[13.5px] font-semibold text-brand-deep">
                                Open on website →
                            </Link>
                        )}
                    </Card>
                ))}
            </div>
        </>
    );
}
