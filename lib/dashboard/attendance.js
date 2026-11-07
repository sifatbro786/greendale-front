import "server-only";

import { isLive } from "@/lib/mode";

import { dispatcher } from "./_dispatch";

/** Demo/live switch (see ./_dispatch.js). Implementations: lib/demo/dashboard/attendance.js lib/live/dashboard/attendance.js */
const call = dispatcher("attendance", () => import("@/lib/demo/dashboard/attendance"), () => import("@/lib/live/dashboard/attendance"));

const dhakaToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date());
const clampToSession = (d) => (d < "2026-02-01" ? "2026-02-01" : d > "2026-12-31" ? "2026-12-31" : d);
/**
 * Today (YYYY-MM-DD, Asia/Dhaka), computed when the server starts, as before.
 * Demo clamps it to the 2026 session like lib/demo/seed DEMO_TODAY.
 * Demo pages are prerendered, so demo keeps this fixed value; live pages use today() below.
 */
export const TODAY = isLive ? dhakaToday() : clampToSession(dhakaToday());

/** Today per request (use this in pages; TODAY is fixed at server start and goes stale after midnight in live). */
export const today = () => (isLive ? dhakaToday() : TODAY);

export const getAttendanceSheet = (...args) => call("getAttendanceSheet", args);
export const attendanceSummary = (...args) => call("attendanceSummary", args);
export const attendanceTrend = (...args) => call("attendanceTrend", args);
export const studentAttendanceMonth = (...args) => call("studentAttendanceMonth", args);
export const monthlyReport = (...args) => call("monthlyReport", args);
export const recentSchoolDays = (...args) => call("recentSchoolDays", args);
export const listHolidays = (...args) => call("listHolidays", args);
