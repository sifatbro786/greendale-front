import NewsEditor from "@/components/dash/cms/NewsEditor";
import { Card, PageHead } from "@/components/dash/ui";
import { requirePermission } from "@/lib/auth/session";
import { cmsOverview } from "@/lib/dashboard/comms";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "New post" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function NewNewsPage() {
    await requirePermission("website.manage");
    const { albums } = await cmsOverview();
    return (
        <>
            <PageHead title="New post" description="News and events for the website. Save as a draft until it is ready." crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Website", href: "/admin/website?tab=news" }, { label: "New post" }]} />
            <Card>
                <NewsEditor albums={albums.map(({ id, title }) => ({ id, title }))} demo={isDemo} />
            </Card>
        </>
    );
}
