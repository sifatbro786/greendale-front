import { Suspense } from "react";

import Frame, { ShellFallback } from "@/components/dash/Frame";
import { staffNav } from "@/lib/auth/nav";
import { requireStaff } from "@/lib/auth/session";

export const metadata = {
    title: { default: "Dashboard", template: "%s · Greendale Admin" },
    robots: { index: false, follow: false },
};

/**
 * Every screen here depends on the signed-in user (cookie), so it can never be part of a shared static shell.
 * Opt out of instant-navigation validation instead of wrapping each page; the layout still streams behind <Suspense>.
 */
export const instant = false;

/* The session is read inside <Suspense> (Cache Components rule); pages render inside the same boundary. */
export default function AdminLayout({ children }) {
    return (
        <Suspense fallback={<ShellFallback />}>
            <AdminFrame>{children}</AdminFrame>
        </Suspense>
    );
}

async function AdminFrame({ children }) {
    const user = await requireStaff();
    return (
        <Frame user={user} nav={staffNav(user.role)} area="admin">
            {children}
        </Frame>
    );
}
