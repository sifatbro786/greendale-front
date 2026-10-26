import { school } from "@/config/school";
import { getAlbums, getNews, getNotices, getPagesBySection } from "@/lib/data";

/** Phase 2: same function, the data layer reads from the API so the sitemap follows the database. */
export default async function sitemap() {
    const base = school.siteUrl.replace(/\/$/, "");
    const [about, academics, notices, news, albums] = await Promise.all([
        getPagesBySection("about"),
        getPagesBySection("academics"),
        getNotices({ limit: 500 }),
        getNews({ limit: 500 }),
        getAlbums(),
    ]);

    const fixed = ["", "/admission/information", "/admission/notices", "/teachers", "/student-corner", "/result", "/notices", "/news", "/gallery", "/facilities", "/contact", "/privacy", "/terms"];

    return [
        ...fixed.map((p) => ({ url: `${base}${p}`, changeFrequency: p === "" || p === "/notices" ? "daily" : "monthly", priority: p === "" ? 1 : 0.7 })),
        ...about.map((p) => ({ url: `${base}/about/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
        ...academics.map((p) => ({ url: `${base}/academics/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
        ...notices.map((n) => ({ url: `${base}/notices/${n.slug}`, lastModified: n.publishedAt, priority: 0.5 })),
        ...news.map((n) => ({ url: `${base}/news/${n.slug}`, lastModified: n.publishedAt, priority: 0.5 })),
        ...albums.map((a) => ({ url: `${base}/gallery/${a.slug}`, lastModified: a.date, priority: 0.4 })),
    ];
}
