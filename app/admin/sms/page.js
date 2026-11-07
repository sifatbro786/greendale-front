import DataTable from "@/components/dash/DataTable";
import SmsComposer from "@/components/dash/SmsComposer";
import { Card, PageHead, StatCard } from "@/components/dash/ui";
import { can } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { smsOverview } from "@/lib/dashboard/comms";
import { isDemo } from "@/lib/mode";
import { redirect } from "next/navigation";

export const metadata = { title: "SMS" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function SmsPage() {
  const user = await requireStaff();
  if (!can(user, "sms.send") && !can(user, "sms.dues")) redirect("/admin");
  const data = await smsOverview();
  const audiences = can(user, "sms.send")
    ? data.audiences
    : data.audiences.filter((a) => a.value === "dues");
  const templates = can(user, "sms.send")
    ? data.templates
    : data.templates.filter((t) => t.type === "FEE_DUE");
  const recent = data.logs; // the latest 300
  const delivered = recent.filter(
    (l) => l.status === "DELIVERED" || l.status === "SENT",
  ).length;
  const balance =
    typeof data.balance === "number"
      ? data.balance.toLocaleString("en-IN")
      : "—";
  return (
    <>
      <PageHead
        title="SMS"
        description="Absent alerts and result SMS go automatically. Use this for notices and reminders."
        crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "SMS" }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="SMS balance"
          value={balance}
          hint={
            typeof data.balance === "number"
              ? "Credits with the gateway"
              : "Gateway does not report a balance"
          }
          icon="MessageSquareText"
        />
        <StatCard
          label="Recent SMS"
          value={recent.length}
          hint={`${delivered} sent or delivered`}
          icon="Send"
          tone="sky"
        />
        <StatCard
          label="Failed"
          value={recent.filter((l) => l.status === "FAILED").length}
          hint="Retried 3 times automatically"
          icon="CircleAlert"
          tone="coral"
        />
      </div>
      <SmsComposer
        audiences={audiences}
        templates={templates}
        balance={data.balance}
        demo={isDemo}
      />
      <Card title="Delivery log" className="mt-4" padded={false}>
        <DataTable
          rows={data.logs}
          columns={[
            { key: "sentAt", label: "Sent", type: "datetime" },
            { key: "studentName", label: "Student", sub: "section" },
            { key: "to", label: "Mobile" },
            {
              key: "type",
              label: "Type",
              type: "badge",
              badgeTones: {
                ABSENT: "red",
                FEE_DUE: "yellow",
                RESULT: "green",
                CUSTOM: "blue",
              },
            },
            { key: "segments", label: "Parts", type: "number" },
            {
              key: "status",
              label: "Status",
              type: "badge",
              badgeTones: {
                QUEUED: "gray",
                PENDING: "gray",
                SENT: "blue",
                DELIVERED: "green",
                FAILED: "red",
              },
            },
          ]}
          searchKeys={["studentName", "to"]}
          filters={[
            {
              key: "status",
              label: "Status",
              options: ["QUEUED", "SENT", "DELIVERED", "FAILED"].map((s) => ({
                value: s,
                label: s.charAt(0) + s.slice(1).toLowerCase(),
              })),
            },
          ]}
          exportName="greendale-sms-log"
        />
      </Card>
    </>
  );
}
