import AlbumEditor from "@/components/dash/cms/AlbumEditor";
import { Card, PageHead } from "@/components/dash/ui";
import { requirePermission } from "@/lib/auth/session";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "New album" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function NewAlbumPage() {
    await requirePermission("website.manage");
    return (
        <>
            <PageHead title="New album" description="Create the album first, then add photos." crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Website", href: "/admin/website?tab=gallery" }, { label: "New album" }]} />
            <Card className="max-w-3xl">
                <AlbumEditor demo={isDemo} />
            </Card>
        </>
    );
}
