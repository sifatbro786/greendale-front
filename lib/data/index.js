/**
 * DATA ACCESS LAYER for the public site (PRD §3.2). Pages and components import only from here.
 * Demo/live switch like lib/dashboard (see lib/dashboard/_dispatch.js):
 *   demo → lib/demo/data.js (static /content)    live → lib/live/data.js (GET /api/public/*)
 * Both implementations use 'use cache' with the same cacheTag names, so a CMS save in the API
 * (revalidateWeb → POST /internal/revalidate) refreshes exactly the affected pages.
 * Shapes: ./types.js.
 */
import { dispatcher } from "@/lib/dashboard/_dispatch";

const call = dispatcher("data", () => import("@/lib/demo/data"), () => import("@/lib/live/data"));

/** @returns {Promise<import("./types").Page | null>} */
export const getPage = (section, slug) => call("getPage", [section, slug]);
/** @returns {Promise<import("./types").Page[]>} */
export const getPagesBySection = (section) => call("getPagesBySection", [section]);
/** @returns {Promise<{ steps: {title:string,text:string}[], documents: string[] }>} */
export const getAdmissionGuide = () => call("getAdmissionGuide", []);
/** @returns {Promise<import("./types").SchoolClass[]>} */
export const getClasses = () => call("getClasses", []);
/** @returns {Promise<import("./types").Notice[]>} */
export const getNotices = (opts) => call("getNotices", [opts]);
/** @returns {Promise<import("./types").Notice | null>} */
export const getNotice = (slug) => call("getNotice", [slug]);
export const getNoticeCategories = () => call("getNoticeCategories", []);
/** @returns {Promise<import("./types").NewsPost[]>} */
export const getNews = (opts) => call("getNews", [opts]);
/** @returns {Promise<import("./types").NewsPost | null>} */
export const getNewsPost = (slug) => call("getNewsPost", [slug]);
/** @returns {Promise<import("./types").GalleryAlbum[]>} */
export const getAlbums = () => call("getAlbums", []);
/** @returns {Promise<import("./types").GalleryAlbum | null>} */
export const getAlbum = (slug) => call("getAlbum", [slug]);
/** @returns {Promise<import("./types").VideoItem[]>} */
export const getVideos = () => call("getVideos", []);
/** @returns {Promise<import("./types").Staff[]>} */
export const getStaff = () => call("getStaff", []);
/** @returns {Promise<import("./types").Facility[]>} */
export const getFacilities = () => call("getFacilities", []);
/** @returns {Promise<import("./types").Download[]>} */
export const getDownloads = () => call("getDownloads", []);
