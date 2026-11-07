import { FileText } from "lucide-react";

import NoticeComposer from "@/components/dash/NoticeComposer";
import RichText from "@/components/site/RichText";
import { Badge, Card, EmptyState, PageHead } from "@/components/dash/ui";
import { can } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/session";
import { listClasses } from "@/lib/dashboard/academics";
import { listStaffNotices } from "@/lib/dashboard/comms";
import { formatDate } from "@/lib/format";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "Notices" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

const STATUS_TONE = { Published: "green", Scheduled: "blue", Draft: "gray" };

export default async function NoticesPage() {
  const user = await requireStaff();
  const manage = can(user, "notices.manage");
  const [notices, classes] = await Promise.all([
    listStaffNotices({}),
    listClasses(),
  ]);
  const className = Object.fromEntries(classes.map((c) => [c.id, c.name]));
  const audience = (a) =>
    a === "PUBLIC"
      ? "Website"
      : a === "STAFF"
        ? "Staff only"
        : a === "ALL"
          ? "Everyone"
          : `Guardians of ${className[a.split(":")[1]] ?? "a class"}`;
  const audiences = [
    { value: "ALL", label: "Everyone (staff + guardians)" },
    { value: "STAFF", label: "Staff only" },
    { value: "PUBLIC", label: "Website (public)" },
    ...classes.map((c) => ({
      value: `CLASS:${c.id}`,
      label: `Guardians of ${c.name}`,
    })),
  ];
  return (
    <>
      <PageHead
        title="Notices"
        description="For staff, guardians, one class, or the public website. Website notices also appear on the site's Notice Board."
        crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Notices" }]}
        actions={
          manage && <NoticeComposer audiences={audiences} demo={isDemo} />
        }
      />
      {notices.length === 0 ? (
        <Card>
          <EmptyState
            title="No notices yet"
            text="Notices you post appear here, in the guardian portal and (for website notices) on the public site."
            icon="Megaphone"
          />
        </Card>
      ) : (
        <div className="grid gap-3">
          {notices.map((n) => (
            <Card key={n.id}>
              <div className="flex flex-wrap items-center gap-2">
                {n.pinned && <Badge tone="yellow">Pinned</Badge>}
                <Badge tone="blue">{audience(n.audience)}</Badge>
                {n.status && n.status !== "Published" && (
                  <Badge tone={STATUS_TONE[n.status]}>{n.status}</Badge>
                )}
                {n.publishedAt && (
                  <span className="text-[13px] text-ink-soft">
                    {formatDate(n.publishedAt, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
                {manage && (
                  <span className="ml-auto">
                    <NoticeComposer
                      audiences={audiences}
                      notice={n}
                      demo={isDemo}
                    />
                  </span>
                )}
              </div>
              <h2 className="mt-2 text-[17px] font-semibold text-ink">
                {n.title}
              </h2>
              {n.bodyHtml ? (
                <RichText
                  html={n.bodyHtml}
                  className="mt-1 text-[15px] text-ink-soft"
                />
              ) : (
                <p className="mt-1 text-[15px] text-ink-soft">{n.body}</p>
              )}
              {n.pdfUrl && (
                <a
                  href={n.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-deep"
                >
                  <FileText className="size-4" aria-hidden="true" /> Attached
                  PDF
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
