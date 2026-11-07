import { notFound } from "next/navigation";

import AlbumEditor from "@/components/dash/cms/AlbumEditor";
import { Card, PageHead } from "@/components/dash/ui";
import { requirePermission } from "@/lib/auth/session";
import { getCmsAlbum } from "@/lib/dashboard/comms";
import { isDemo } from "@/lib/mode";

export const metadata = { title: "Album" };

/** Signed-in, per-user screen: renders at request time (see app/admin/layout.js). */
export const instant = false;

export default async function AlbumPage({ params }) {
    await requirePermission("website.manage");
    const { id } = await params;
    const album = await getCmsAlbum(id);
    if (!album) notFound();
    return (
        <>
            <PageHead title={album.title} crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Website", href: "/admin/website?tab=gallery" }, { label: album.title }]} />
            <Card>
                <AlbumEditor album={album} demo={isDemo} />
            </Card>
        </>
    );
}
