import { notFound } from "next/navigation";

import { AttendanceCalendar, InvoiceTable, PaymentList, ResultsTable } from "@/components/dash/StudentBlocks";
import Tabs from "@/components/dash/Tabs";
import WaiverEditor from "@/components/dash/fees/WaiverEditor";
import StudentProfileActions from "@/components/dash/students/StudentProfileActions";
import { Avatar, Badge, Card, DefinitionList, PageHead, StatCard } from "@/components/dash/ui";
import { can, hasModule } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { listSectionOptions, teacherSections } from "@/lib/dashboard/academics";
import { studentAttendanceMonth, today } from "@/lib/dashboard/attendance";
import { studentResults } from "@/lib/dashboard/exams";
import { listConcessions, studentLedger } from "@/lib/dashboard/fees";
import { getStudent } from "@/lib/dashboard/students";
import { formatDate, formatMoney } from "@/lib/format";
import { isDemo, isLive } from "@/lib/mode";

export const metadata = { title: "Student profile" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function StudentProfilePage({ params }) {
    const user = await requirePermission("students.view");
    const { id } = await params;
    const s = await getStudent(id);
    if (!s) notFound();
    // "Own class" scope: a teacher asking for another student gets 404 (ids can't be probed).
    if (user.role === "TEACHER" && !(await teacherSections(user.staffId)).some((x) => x.value === s.sectionId)) notFound();

    const canEdit = can(user, "students.manage");
    // Results / fees tabs only when the module is on (and fees only for fees.view holders).
    const feesOn = can(user, "fees.view") && hasModule(user, "fees");
    const [month, results, ledger, sections, waivers] = await Promise.all([
        hasModule(user, "attendance") ? studentAttendanceMonth(id, today().slice(0, 7)) : null,
        hasModule(user, "results") ? studentResults(id) : null,
        feesOn ? studentLedger(id) : null,
        canEdit ? listSectionOptions() : [],
        feesOn ? listConcessions(id) : null,
    ]);

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "attendance", label: "Attendance" },
        ...(results ? [{ id: "results", label: "Results" }] : []),
        ...(ledger ? [{ id: "fees", label: "Fees" }] : []),
    ];

    return (
        <>
            <PageHead
                title={s.name}
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: user.role === "TEACHER" ? "My classes" : "Students", href: "/admin/students" }, { label: s.name }]}
                actions={
                    canEdit && <StudentProfileActions student={s} sections={sections.map(({ value, label }) => ({ value, label }))} demo={isDemo} />
                }
            />

            <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
                <Card>
                    <div className="flex items-center gap-4">
                        {isLive && s.hasPhoto ? (
                            // eslint-disable-next-line @next/next/no-img-element -- private photo served by the API after a scope check
                            <img src={`/api/students/${s.id}/photo`} alt="" className="size-16 shrink-0 rounded-full object-cover" />
                        ) : (
                            <Avatar name={s.name} size="lg" tone="soft" />
                        )}
                        <div>
                            <p className="text-lg font-semibold text-ink">{s.name}</p>
                            <p className="text-[14px] text-ink-soft">{s.studentUid}</p>
                            <Badge tone={s.status === "ACTIVE" ? "green" : "gray"} className="mt-1.5">
                                {s.status === "ACTIVE" ? "Active" : s.status.charAt(0) + s.status.slice(1).toLowerCase()}
                            </Badge>
                        </div>
                    </div>
                    <dl className="mt-6 grid grid-cols-2 gap-3 text-[14px]">
                        <div className="rounded-xl bg-paper p-3">
                            <dt className="text-[12px] text-ink-soft">Class</dt>
                            <dd className="font-semibold text-ink">{s.section}</dd>
                        </div>
                        <div className="rounded-xl bg-paper p-3">
                            <dt className="text-[12px] text-ink-soft">Roll</dt>
                            <dd className="font-semibold text-ink">{s.roll}</dd>
                        </div>
                        <div className="rounded-xl bg-paper p-3">
                            <dt className="text-[12px] text-ink-soft">Attendance</dt>
                            <dd className="font-semibold text-ink">{s.attendance.rate}%</dd>
                        </div>
                        <div className="rounded-xl bg-paper p-3">
                            <dt className="text-[12px] text-ink-soft">Dues</dt>
                            <dd className={`font-semibold ${s.due ? "text-coral" : "text-ink"}`}>{can(user, "fees.view") ? formatMoney(s.due) : "—"}</dd>
                        </div>
                    </dl>
                    <a href={`tel:${s.guardianPhone.replace(/-/g, "")}`} className="btn-ghost mt-5 w-full text-[14px]">
                        Call guardian · {s.guardianPhone}
                    </a>
                </Card>

                <Card>
                    <Tabs
                        tabs={tabs}
                        panels={{
                            overview: (
                                <div className="space-y-8">
                                    <DefinitionList
                                        items={[
                                            ["Date of birth", formatDate(s.dob, { day: "numeric", month: "long", year: "numeric" })],
                                            ["Gender", s.gender === "FEMALE" ? "Female" : "Male"],
                                            ["Blood group", s.bloodGroup],
                                            ["Admission date", formatDate(s.admissionDate)],
                                            ["Father's name", s.fatherName],
                                            ["Mother's name", s.motherName],
                                            ["Guardian mobile", s.guardianPhone],
                                            ["Address", s.address],
                                        ]}
                                    />
                                    <div>
                                        <h3 className="text-[15px] font-semibold text-ink">Enrollment history</h3>
                                        <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
                                            {s.history.map((h) => (
                                                <li key={h.session} className="flex justify-between px-4 py-2.5 text-[14px]">
                                                    <span className="font-medium">Session {h.session}</span>
                                                    <span className="text-ink-soft">
                                                        {h.section} · Roll {h.roll}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ),
                            attendance: (
                                <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
                                    {month ? <AttendanceCalendar data={month} /> : <p className="text-ink-soft">Not enrolled in the current session.</p>}
                                    <div className="grid content-start gap-3">
                                        <StatCard label="This session" value={`${s.attendance.rate}%`} hint={`${s.attendance.absent} absent · ${s.attendance.late} late`} icon="CalendarCheck" />
                                    </div>
                                </div>
                            ),
                            ...(results ? { results: <ResultsTable results={results} /> } : {}),
                            ...(ledger
                                ? {
                                      fees: (
                                          <div className="space-y-6">
                                              <div className="grid gap-3 sm:grid-cols-3">
                                                  <StatCard label="Billed" value={formatMoney(ledger.totals.billed)} icon="ReceiptText" tone="ink" />
                                                  <StatCard label="Paid" value={formatMoney(ledger.totals.paid)} icon="Wallet" />
                                                  <StatCard label="Due" value={formatMoney(ledger.totals.due)} icon="CircleAlert" tone="coral" />
                                              </div>
                                              <InvoiceTable invoices={ledger.invoices} />
                                              <div>
                                                  <h3 className="text-[15px] font-semibold text-ink">Payments</h3>
                                                  <PaymentList payments={ledger.payments.slice(0, 8)} receiptHref={(pid) => `/admin/fees/payments/${pid}`} />
                                              </div>
                                              {waivers && <WaiverEditor studentId={s.id} data={waivers} canManage={can(user, "fees.manage")} demo={isDemo} />}
                                          </div>
                                      ),
                                  }
                                : {}),
                        }}
                    />
                </Card>
            </div>
        </>
    );
}
