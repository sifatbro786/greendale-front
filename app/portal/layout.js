import { Suspense } from "react";

import Frame, { ShellFallback } from "@/components/dash/Frame";
import { portalNav } from "@/lib/auth/nav";
import { requireStudent } from "@/lib/auth/session";

export const metadata = {
    title: { default: "Student Portal", template: "%s · Greendale Portal" },
    robots: { index: false, follow: false },
};

/**
 * Every screen here depends on the signed-in user (cookie), so it can never be part of a shared static shell.
 * Opt out of instant-navigation validation; the layout still streams behind <Suspense>.
 */
export const instant = false;

export default function PortalLayout({ children }) {
    return (
        <Suspense fallback={<ShellFallback />}>
            <PortalFrame>{children}</PortalFrame>
        </Suspense>
    );
}

async function PortalFrame({ children }) {
    const user = await requireStudent();
    return (
        <Frame user={user} nav={portalNav} area="portal">
            {children}
        </Frame>
    );
}
