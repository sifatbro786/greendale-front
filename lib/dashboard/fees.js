import "server-only";

import { dispatcher } from "./_dispatch";

/** Demo/live switch (see ./_dispatch.js). Implementations: lib/demo/dashboard/fees.js (live: not ported yet) */
const call = dispatcher("fees", () => import("@/lib/demo/dashboard/fees"));

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-03" → "Mar 2026" */
export const monthLabel = (ym) => `${MONTH_NAMES[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;

export const studentLedger = (...args) => call("studentLedger", args);
export const dueList = (...args) => call("dueList", args);
export const listPayments = (...args) => call("listPayments", args);
export const getReceipt = (...args) => call("getReceipt", args);
export const feeSummary = (...args) => call("feeSummary", args);
export const feeStructure = (...args) => call("feeStructure", args);
