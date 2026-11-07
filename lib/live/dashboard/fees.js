import "server-only";

import { apiData, apiFetch } from "@/lib/api/server";

/** Live implementation of lib/dashboard/fees (greendale-back modules/fees; guardian own scope in the API). */

async function maybe(path, what) {
    const r = await apiFetch(path);
    if (r.status === 404 || r.status === 400) return null;
    if (!r.ok) throw new Error(r.error?.message || `Could not load ${what}.`);
    return r.data;
}

export const studentLedger = (studentId) => maybe(`/api/fees/students/${encodeURIComponent(studentId)}/ledger`, "the ledger");
export const dueList = () => apiData("/api/fees/dues");
export const collectList = () => apiData("/api/fees/collect-list");
export const listPayments = ({ limit = 400 } = {}) => apiData(`/api/fees/payments?limit=${limit}`);
export const getReceipt = (paymentId) => maybe(`/api/fees/payments/${encodeURIComponent(paymentId)}`, "the receipt");
export const feeSummary = () => apiData("/api/fees/summary");
export const feeStructure = () => apiData("/api/fees/structure");
