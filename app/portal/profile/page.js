import DemoButton from "@/components/dash/DemoButton";
import { Avatar, Card, DefinitionList, PageHead } from "@/components/dash/ui";
import { requireStudent } from "@/lib/auth/session";
import { getStudent } from "@/lib/dashboard/students";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Profile" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

const field = "mt-1 block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10";

export default async function PortalProfile() {
    const user = await requireStudent();
    const s = await getStudent(user.studentId);
    return (
        <>
            <PageHead title="Profile" description="To correct any detail, please contact the school office." />
            <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                <Card>
                    <div className="mb-6 flex items-center gap-4">
                        <Avatar name={s.name} size="lg" tone="soft" />
                        <div>
                            <p className="text-lg font-semibold">{s.name}</p>
                            <p className="text-[14px] text-ink-soft">
                                {s.section} · Roll {s.roll}
                            </p>
                        </div>
                    </div>
                    <DefinitionList
                        items={[
                            ["Student ID", s.studentUid],
                            ["Date of birth", formatDate(s.dob, { day: "numeric", month: "long", year: "numeric" })],
                            ["Blood group", s.bloodGroup],
                            ["Father's name", s.fatherName],
                            ["Mother's name", s.motherName],
                            ["Guardian mobile", s.guardianPhone],
                            ["Address", s.address],
                            ["Admitted", formatDate(s.admissionDate)],
                        ]}
                    />
                </Card>
                <Card title="Change password" description="At least 8 characters. You will stay signed in on this device.">
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-[14px] font-medium">Current password</span>
                            <input type="password" autoComplete="current-password" className={field} />
                        </label>
                        <label className="block">
                            <span className="text-[14px] font-medium">New password</span>
                            <input type="password" autoComplete="new-password" minLength={8} className={field} />
                        </label>
                        <label className="block">
                            <span className="text-[14px] font-medium">Confirm new password</span>
                            <input type="password" autoComplete="new-password" minLength={8} className={field} />
                        </label>
                        <DemoButton className="btn-primary w-full">Update password</DemoButton>
                    </div>
                </Card>
            </div>
        </>
    );
}
