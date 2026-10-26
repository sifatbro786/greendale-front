import DataTable from "@/components/dash/DataTable";
import { Card, PageHead } from "@/components/dash/ui";
import { requirePermission } from "@/lib/auth/session";
import { listAudit } from "@/lib/dashboard/comms";

export const metadata = { title: "Audit log" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function AuditPage() {
    await requirePermission("audit.view");
    const rows = await listAudit();
    return (
        <>
            <PageHead title="Audit log" description="Marks changes, publish/unpublish, payment reversals, role changes and sign-ins. Entries cannot be edited." crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Audit log" }]} />
            <Card padded={false}>
                <DataTable
                    rows={rows}
                    columns={[
                        { key: "createdAt", label: "When", type: "datetime" },
                        { key: "actor", label: "Who" },
                        { key: "action", label: "Action" },
                        { key: "detail", label: "Details" },
                        { key: "ip", label: "IP", hideOnMobile: true },
                    ]}
                    searchKeys={["actor", "action", "detail"]}
                    exportName="greendale-audit-log"
                    initialSort={{ key: "createdAt", dir: "desc" }}
                />
            </Card>
        </>
    );
}
