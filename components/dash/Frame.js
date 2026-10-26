import { school } from "@/config/school";
import { ROLE_LABEL } from "@/lib/auth/permissions";

import DashShell from "./DashShell";

/** Server wrapper: turns the session user into serialisable props for the client shell. */
export default function Frame({ user, nav, area, children }) {
    return (
        <DashShell
            area={area}
            nav={nav}
            logo={{ src: school.logo.crest, width: school.logo.width, height: school.logo.height }}
            user={{ name: user.name, roleLabel: ROLE_LABEL[user.role], subtitle: user.title ? `${user.title} · ${ROLE_LABEL[user.role]}` : user.identifier }}
        >
            {children}
        </DashShell>
    );
}

/** Fallback while the session streams in (keeps the layout stable). */
export function ShellFallback() {
    return (
        <div className="min-h-screen bg-[#F6F4EE]">
            <div className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white lg:block" />
            <div className="animate-pulse space-y-4 p-6 lg:pl-72">
                <div className="h-8 w-56 rounded-lg bg-ink/10" />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="h-28 rounded-2xl bg-white" />
                    ))}
                </div>
                <div className="h-72 rounded-2xl bg-white" />
            </div>
        </div>
    );
}
