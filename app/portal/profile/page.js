import ChangePasswordForm from "@/components/dash/admin/ChangePasswordForm";
import { Avatar, Card, DefinitionList, PageHead } from "@/components/dash/ui";
import { requireStudent } from "@/lib/auth/session";
import { getStudent } from "@/lib/dashboard/students";
import { formatDate } from "@/lib/format";
import { isDemo } from "@/lib/mode";

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
                    <ChangePasswordForm demo={isDemo} home="/portal" />
                </Card>
            </div>
        </>
    );
}
