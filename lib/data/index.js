/**
 * DATA ACCESS LAYER (PRD §3.2)
 *
 * Pages and components NEVER import from /content directly — only from here.
 * Phase 1: functions read static objects from /content.
 * Phase 2: only the body of each function changes to
 *   const res = await fetch(`${process.env.API_INTERNAL_URL}/api/public/...`);
 * keeping the same 'use cache' + cacheTag so the API can call /internal/revalidate
 * (revalidateTag(tag, "max")) whenever content is saved in the admin panel.
 *
 * Every function returns the shapes documented in ./types.js.
 */
import { cacheLife, cacheTag } from "next/cache";

import { classes } from "@/content/classes";
import { albums, videos } from "@/content/gallery";
import { downloads, facilities, staff } from "@/content/misc";
import { news } from "@/content/news";
import { noticeCategories, notices } from "@/content/notices";
import { admissionDocuments, admissionSteps, pages } from "@/content/pages";

const byDateDesc = (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt);

/* ------------------------------- Pages ------------------------------- */

/**
 * @param {import("./types").Page["section"]} section
 * @param {string} slug
 * @returns {Promise<import("./types").Page | null>}
 */
export async function getPage(section, slug) {
    "use cache";
    cacheLife("hours");
    cacheTag("pages", `page:${section}:${slug}`);
    return pages.find((p) => p.section === section && p.slug === slug) ?? null;
}

/**
 * @param {import("./types").Page["section"]} section
 * @returns {Promise<import("./types").Page[]>}
 */
export async function getPagesBySection(section) {
    "use cache";
    cacheLife("hours");
    cacheTag("pages");
    return pages.filter((p) => p.section === section);
}

/** @returns {Promise<{ steps: {title:string,text:string}[], documents: string[] }>} */
export async function getAdmissionGuide() {
    "use cache";
    cacheLife("hours");
    cacheTag("pages");
    return { steps: admissionSteps, documents: admissionDocuments };
}

/* ------------------------------ Academics ---------------------------- */

/** @returns {Promise<import("./types").SchoolClass[]>} */
export async function getClasses() {
    "use cache";
    cacheLife("days");
    cacheTag("classes");
    return [...classes].sort((a, b) => a.order - b.order);
}

/* ------------------------------- Notices ----------------------------- */

/**
 * Published notices only (publishedAt in the future = scheduled, hidden). Pinned first.
 * @param {{ limit?: number, category?: string }} [opts]
 * @returns {Promise<import("./types").Notice[]>}
 */
export async function getNotices({ limit = 50, category } = {}) {
    "use cache";
    cacheLife("minutes");
    cacheTag("notices");
    const now = Date.now();
    return notices
        .filter((n) => new Date(n.publishedAt).getTime() <= now)
        .filter((n) => !category || category === "all" || n.category === category)
        .sort((a, b) => Number(b.pinned) - Number(a.pinned) || byDateDesc(a, b))
        .slice(0, limit);
}

/**
 * @param {string} slug
 * @returns {Promise<import("./types").Notice | null>}
 */
export async function getNotice(slug) {
    "use cache";
    cacheLife("minutes");
    cacheTag("notices", `notice:${slug}`);
    const n = notices.find((x) => x.slug === slug);
    if (!n || new Date(n.publishedAt).getTime() > Date.now()) return null;
    return n;
}

export async function getNoticeCategories() {
    "use cache";
    cacheLife("days");
    return noticeCategories;
}

/* -------------------------------- News ------------------------------- */

/**
 * @param {{ limit?: number }} [opts]
 * @returns {Promise<import("./types").NewsPost[]>}
 */
export async function getNews({ limit = 50 } = {}) {
    "use cache";
    cacheLife("hours");
    cacheTag("news");
    return [...news].sort(byDateDesc).slice(0, limit);
}

/**
 * @param {string} slug
 * @returns {Promise<import("./types").NewsPost | null>}
 */
export async function getNewsPost(slug) {
    "use cache";
    cacheLife("hours");
    cacheTag("news", `news:${slug}`);
    return news.find((x) => x.slug === slug) ?? null;
}

/* ------------------------------- Gallery ----------------------------- */

/** @returns {Promise<import("./types").GalleryAlbum[]>} */
export async function getAlbums() {
    "use cache";
    cacheLife("hours");
    cacheTag("gallery");
    return [...albums].sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * @param {string} slug
 * @returns {Promise<import("./types").GalleryAlbum | null>}
 */
export async function getAlbum(slug) {
    "use cache";
    cacheLife("hours");
    cacheTag("gallery", `album:${slug}`);
    return albums.find((a) => a.slug === slug) ?? null;
}

/** @returns {Promise<import("./types").VideoItem[]>} */
export async function getVideos() {
    "use cache";
    cacheLife("hours");
    cacheTag("gallery");
    return videos;
}

/* ------------------------------ Everything else ---------------------- */

/** @returns {Promise<import("./types").Staff[]>} */
export async function getStaff() {
    "use cache";
    cacheLife("days");
    cacheTag("staff");
    return [...staff].sort((a, b) => a.order - b.order);
}

/** @returns {Promise<import("./types").Facility[]>} */
export async function getFacilities() {
    "use cache";
    cacheLife("days");
    cacheTag("pages");
    return facilities;
}

/** @returns {Promise<import("./types").Download[]>} */
export async function getDownloads() {
    "use cache";
    cacheLife("hours");
    cacheTag("downloads");
    return [...downloads].sort(byDateDesc);
}
