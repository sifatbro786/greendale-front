import DemoButton from "@/components/dash/DemoButton";
import { Card, PageHead } from "@/components/dash/ui";
import { school } from "@/config/school";
import { requirePermission } from "@/lib/auth/session";

export const metadata = { title: "Settings" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

const field = "mt-1 block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10";
const MODULE_LABEL = { cms: "Website CMS", students: "Students & classes", results: "Exams & results", attendance: "Attendance", routine: "Routine", cards: "Admit & ID cards", fees: "Fees & payments", sms: "SMS", portal: "Student portal" };

export default async function SettingsPage() {
    await requirePermission("settings.manage");
    return (
        <>
            <PageHead title="Settings" description="School identity and system rules. Values here (not code) make this platform work for any school." crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Settings" }]} actions={<DemoButton className="btn-primary min-h-10 text-[14px]">Save changes</DemoButton>} />
            <div className="grid gap-4 xl:grid-cols-2">
                <Card title="School">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="sm:col-span-2">
                            <span className="text-[14px] font-medium">School name</span>
                            <input defaultValue={school.name} className={field} />
                        </label>
                        <label>
                            <span className="text-[14px] font-medium">EIIN</span>
                            <input defaultValue={school.eiin} className={field} />
                        </label>
                        <label>
                            <span className="text-[14px] font-medium">Phone / WhatsApp</span>
                            <input defaultValue={school.contact.phone} className={field} />
                        </label>
                        <label className="sm:col-span-2">
                            <span className="text-[14px] font-medium">Address</span>
                            <input defaultValue={school.contact.addressLines.join(", ")} className={field} />
                        </label>
                        <label>
                            <span className="text-[14px] font-medium">Facebook</span>
                            <input defaultValue={school.social.facebook} className={field} />
                        </label>
                        <label>
                            <span className="text-[14px] font-medium">YouTube</span>
                            <input defaultValue={school.social.youtube} className={field} />
                        </label>
                        <label>
                            <span className="text-[14px] font-medium">Brand colour</span>
                            <span className="mt-1 flex items-center gap-2">
                                <input type="color" defaultValue={school.theme.brand} className="h-11 w-14 rounded-lg border border-line" />
                                <code className="text-[13px] text-ink-soft">{school.theme.brand}</code>
                            </span>
                        </label>
                        <label>
                            <span className="text-[14px] font-medium">Logo</span>
                            <input type="file" accept="image/png,image/webp,image/jpeg" className={`${field} py-2`} />
                        </label>
                    </div>
                </Card>
                <div className="grid content-start gap-4">
                    <Card title="Attendance & SMS">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label>
                                <span className="text-[14px] font-medium">Absent SMS cut-off</span>
                                <input type="time" defaultValue="10:30" className={field} />
                                <span className="mt-1 block text-[12.5px] text-ink-soft">One SMS per absent student per day, after this time.</span>
                            </label>
                            <label>
                                <span className="text-[14px] font-medium">Weekly holidays</span>
                                <select defaultValue="FRI_SAT" className={field}>
                                    <option value="FRI_SAT">Friday & Saturday</option>
                                    <option value="FRI">Friday only</option>
                                </select>
                            </label>
                            <label>
                                <span className="text-[14px] font-medium">Hold admit card if dues above</span>
                                <input type="number" defaultValue={3000} className={field} />
                            </label>
                            <label>
                                <span className="text-[14px] font-medium">Result position tie-break</span>
                                <select className={field}>
                                    <option>Total, then roll</option>
                                    <option>Total, then name</option>
                                </select>
                            </label>
                        </div>
                    </Card>
                    <Card title="Enabled modules" description="Turn modules on per school; menus and API routes follow.">
                        <ul className="grid gap-2 sm:grid-cols-2">
                            {school.enabledModules.map((m) => (
                                <li key={m}>
                                    <label className="flex items-center gap-2.5 rounded-xl border border-line px-3 py-2.5 text-[14.5px]">
                                        <input type="checkbox" defaultChecked className="size-4 accent-[var(--brand)]" />
                                        {MODULE_LABEL[m] ?? m}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </>
    );
}
