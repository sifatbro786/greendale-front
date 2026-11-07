import { notFound } from "next/navigation";

import PageEditor from "@/components/dash/cms/PageEditor";
import { Card, PageHead } from "@/components/dash/ui";
import { requirePermission } from "@/lib/auth/session";
import { getCmsPage } from "@/lib/dashboard/comms";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "Edit page" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function EditPagePage({ params }) {
    await requirePermission("website.manage");
    const { id } = await params;
    const page = await getCmsPage(id);
    if (!page) notFound();
    return (
        <>
            <PageHead title={page.title} description={`Website page · ${page.href}`} crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Website", href: "/admin/website?tab=pages" }, { label: page.title }]} />
            <Card>
                <PageEditor key={page.updatedAt} page={page} demo={isDemo} />
            </Card>
        </>
    );
}
