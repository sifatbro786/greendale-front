import NoticeComposer from "@/components/dash/NoticeComposer";
import { Badge, Card, PageHead } from "@/components/dash/ui";
import { can } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { listSectionOptions } from "@/lib/dashboard/academics";
import { listStaffNotices } from "@/lib/dashboard/comms";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Notices" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function NoticesPage() {
    const user = await requireStaff();
    const [notices, sections] = await Promise.all([listStaffNotices({ classId: "c5" }), listSectionOptions()]);
    const audience = (a) => (a === "STAFF" ? "Staff only" : a === "ALL" ? "Everyone" : `Class ${sections.find((s) => s.classId === a.split(":")[1])?.label ?? ""}`);
    return (
        <>
            <PageHead
                title="Notices"
                description="Internal notices for staff, guardians or one class. Website notices are managed under Website."
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Notices" }]}
                actions={can(user.role, "notices.manage") && <NoticeComposer audiences={[{ value: "ALL", label: "Everyone (staff + guardians)" }, { value: "STAFF", label: "Staff only" }, ...sections.map((s) => ({ value: `CLASS:${s.classId}`, label: `Guardians of ${s.label}` }))]} />}
            />
            <div className="grid gap-3">
                {notices.map((n) => (
                    <Card key={n.id}>
                        <div className="flex flex-wrap items-center gap-2">
                            {n.pinned && <Badge tone="yellow">Pinned</Badge>}
                            <Badge tone="blue">{audience(n.audience)}</Badge>
                            <span className="text-[13px] text-ink-soft">{formatDate(n.publishedAt, { day: "numeric", month: "long", year: "numeric" })}</span>
                        </div>
                        <h2 className="mt-2 text-[17px] font-semibold text-ink">{n.title}</h2>
                        <p className="mt-1 text-[15px] text-ink-soft">{n.body}</p>
                    </Card>
                ))}
            </div>
        </>
    );
}
