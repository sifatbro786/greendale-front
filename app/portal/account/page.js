import ChangePasswordForm from "@/components/dash/admin/ChangePasswordForm";
import { Card, PageHead } from "@/components/dash/ui";
import { requireStudent } from "@/lib/auth/session";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "Change password" };

/** Signed-in, per-user screen: renders at request time (see app/portal/layout.js). */
export const instant = false;

export default async function AccountPage() {
    const user = await requireStudent();
    const forced = Boolean(user.mustChangePassword);
    return (
        <>
            <PageHead
                title={forced ? "Choose your password" : "Change password"}
                description={forced ? "You signed in with a one-time password. Choose your own password to continue." : "Changing your password signs you out on every other device."}
                crumbs={forced ? undefined : [{ label: "Dashboard", href: "/portal" }, { label: "Change password" }]}
            />
            <Card className="max-w-xl">
                <ChangePasswordForm demo={isDemo} forced={forced} home="/portal" />
            </Card>
        </>
    );
}
