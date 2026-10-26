import { UserPlus } from "lucide-react";

import DemoButton from "@/components/dash/DemoButton";
import { Avatar, Card, PageHead } from "@/components/dash/ui";
import { requirePermission } from "@/lib/auth/session";
import { listStaff } from "@/lib/dashboard/academics";

export const metadata = { title: "Teachers & staff" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function StaffPage() {
    await requirePermission("academics.manage");
    const staff = await listStaff();
    return (
        <>
            <PageHead
                title="Teachers & staff"
                description="Subject assignments decide what each teacher can see and enter. Turn on 'Show on website' to list a teacher on the public site."
                crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Teachers & staff" }]}
                actions={
                    <DemoButton className="btn-primary min-h-10 text-[14px]">
                        <UserPlus className="size-4" aria-hidden="true" /> Add staff
                    </DemoButton>
                }
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {staff.map((t) => (
                    <Card key={t.id}>
                        <div className="flex items-center gap-3.5">
                            <Avatar name={t.name} tone="soft" />
                            <div className="min-w-0">
                                <p className="font-semibold text-ink">{t.name}</p>
                                <p className="text-[13.5px] text-ink-soft">{t.designation}</p>
                            </div>
                        </div>
                        <p className="mt-3 text-[13.5px] text-ink-soft">
                            {t.qualification} · {t.phone}
                        </p>
                        {t.classTeacherOf.length > 0 && <p className="mt-2 text-[13.5px] text-ink">Class teacher: {t.classTeacherOf.join(", ")}</p>}
                        <ul className="mt-3 flex flex-wrap gap-1.5">
                            {t.subjects.slice(0, 6).map((s) => (
                                <li key={s} className="rounded-md bg-paper px-2 py-1 text-[12px] text-ink">
                                    {s}
                                </li>
                            ))}
                            {t.subjects.length > 6 && <li className="px-1 py-1 text-[12px] text-ink-soft">+{t.subjects.length - 6} more</li>}
                        </ul>
                    </Card>
                ))}
            </div>
        </>
    );
}
