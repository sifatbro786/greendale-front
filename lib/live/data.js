import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { noticeCategories } from "@/content/notices";
import { apiFetch } from "@/lib/api/server";

/**
 * Public site data, LIVE implementation: GET /api/public/* (no auth, no cookies, so it can be cached).
 * Same cache lifetimes and tags as lib/demo/data.js. The API revalidates the tags after CMS saves;
 * cacheLife is only the fallback. Note: the live `next build` prerenders public pages, so the API
 * must be running (and reachable at API_INTERNAL_URL) during the build.
 */

async function pub(path) {
    const r = await apiFetch(`/api/public${path}`, { auth: false, noStore: false });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(r.error?.message || `API /api/public${path} failed with ${r.status}`);
    return r.data;
}

export async function getPage(section, slug) {
    "use cache";
    cacheLife("hours");
    cacheTag("pages", `page:${section}:${slug}`);
    return pub(`/pages/${encodeURIComponent(section)}/${encodeURIComponent(slug)}`);
}

export async function getPagesBySection(section) {
    "use cache";
    cacheLife("hours");
    cacheTag("pages");
    return pub(`/pages?section=${encodeURIComponent(section)}`);
}

export async function getAdmissionGuide() {
    "use cache";
    cacheLife("hours");
    cacheTag("pages");
    return pub("/admission-guide");
}

export async function getClasses() {
    "use cache";
    cacheLife("days");
    cacheTag("classes");
    return pub("/classes");
}

export async function getNotices({ limit = 50, category } = {}) {
    "use cache";
    cacheLife("minutes");
    cacheTag("notices");
    const q = new URLSearchParams({ limit: String(limit), ...(category && { category }) });
    return pub(`/notices?${q}`);
}

export async function getNotice(slug) {
    "use cache";
    cacheLife("minutes");
    cacheTag("notices", `notice:${slug}`);
    return pub(`/notices/${encodeURIComponent(slug)}`);
}

/** Fixed list (config, not content). */
export async function getNoticeCategories() {
    "use cache";
    cacheLife("days");
    return noticeCategories;
}

export async function getNews({ limit = 50 } = {}) {
    "use cache";
    cacheLife("hours");
    cacheTag("news");
    return pub(`/news?limit=${limit}`);
}

export async function getNewsPost(slug) {
    "use cache";
    cacheLife("hours");
    cacheTag("news", `news:${slug}`);
    return pub(`/news/${encodeURIComponent(slug)}`);
}

export async function getAlbums() {
    "use cache";
    cacheLife("hours");
    cacheTag("gallery");
    return pub("/albums");
}

export async function getAlbum(slug) {
    "use cache";
    cacheLife("hours");
    cacheTag("gallery", `album:${slug}`);
    return pub(`/albums/${encodeURIComponent(slug)}`);
}

export async function getVideos() {
    "use cache";
    cacheLife("hours");
    cacheTag("gallery");
    return pub("/videos");
}

export async function getStaff() {
    "use cache";
    cacheLife("days");
    cacheTag("staff");
    return pub("/staff");
}

export async function getFacilities() {
    "use cache";
    cacheLife("days");
    cacheTag("pages");
    return pub("/facilities");
}

export async function getDownloads() {
    "use cache";
    cacheLife("hours");
    cacheTag("downloads");
    return pub("/downloads");
}
