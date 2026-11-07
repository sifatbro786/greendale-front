import { notFound } from "next/navigation";

import NewsEditor from "@/components/dash/cms/NewsEditor";
import { Card, PageHead } from "@/components/dash/ui";
import { requirePermission } from "@/lib/auth/session";
import { cmsOverview, getCmsNews } from "@/lib/dashboard/comms";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "Edit post" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function EditNewsPage({ params }) {
    await requirePermission("website.manage");
    const { id } = await params;
    const [post, { albums }] = await Promise.all([getCmsNews(id), cmsOverview()]);
    if (!post) notFound();
    return (
        <>
            <PageHead title={post.title} crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Website", href: "/admin/website?tab=news" }, { label: "Edit post" }]} />
            <Card>
                <NewsEditor key={post.updatedAt} post={post} albums={albums.map(({ id: aid, title }) => ({ id: aid, title }))} demo={isDemo} />
            </Card>
        </>
    );
}
