import NoticeBoard from "@/components/site/NoticeBoard";
import PageHeader from "@/components/site/PageHeader";
import { getNoticeCategories, getNotices } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const metadata = {
    title: "Notice Board",
    description: "Latest notices from Greendale English Version School: admission, exams, holidays and events.",
    alternates: { canonical: "/notices" },
};

export default async function NoticesPage() {
    const [notices, categories] = await Promise.all([getNotices({ limit: 200 }), getNoticeCategories()]);
    // Format dates on the server so client and server never disagree on timezone.
    const rows = notices.map((n) => ({ ...n, bodyHtml: undefined, dateLabel: formatDate(n.publishedAt) }));
    return (
        <>
            <PageHeader title="Notice Board" summary="Admission, exam, holiday and event notices from the school office." tone="sun" crumbs={[{ label: "Notice Board" }]} />
            <div className="container-x max-w-5xl py-14 lg:py-20">
                <NoticeBoard notices={rows} categories={categories} />
            </div>
        </>
    );
}
