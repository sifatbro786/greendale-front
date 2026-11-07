import "server-only";

import { dispatcher } from "./_dispatch";

/** Demo/live switch (see ./_dispatch.js). Implementations: lib/demo/dashboard/comms.js, lib/live/dashboard/comms.js */
const call = dispatcher("comms", () => import("@/lib/demo/dashboard/comms"), () => import("@/lib/live/dashboard/comms"));

export const listStaffNotices = (...args) => call("listStaffNotices", args);
export const portalNotices = (...args) => call("portalNotices", args);
export const cmsOverview = (...args) => call("cmsOverview", args);
export const smsOverview = (...args) => call("smsOverview", args);
export const listAudit = (...args) => call("listAudit", args);
export const getCmsPage = (...args) => call("getCmsPage", args);
export const getCmsNews = (...args) => call("getCmsNews", args);
export const getCmsAlbum = (...args) => call("getCmsAlbum", args);
