import SettingsForm from "@/components/dash/settings/SettingsForm";
import { PageHead } from "@/components/dash/ui";
import { school } from "@/config/school";
import { requirePermission } from "@/lib/auth/session";
import { getSettings } from "@/lib/dashboard/settings";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "Settings" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function SettingsPage() {
    await requirePermission("settings.manage");
    const settings = await getSettings();
    return (
        <>
            <PageHead title="Settings" description="School identity and system rules. Values here (not code) make this platform work for any school." crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Settings" }]} />
            <SettingsForm initial={settings} brand={school.theme.brand} demo={isDemo} />
        </>
    );
}
