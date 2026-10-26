import "server-only";

import { classMap, db, enrollmentByStudent, feeHeadMap, invoiceDue, paidByInvoice, sectionLabel, TODAY } from "./_shared";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const monthLabel = (ym) => `${MONTH_NAMES[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;

function invoiceRow(inv) {
    const paid = paidByInvoice.get(inv.id) ?? 0;
    const due = invoiceDue(inv);
    return {
        id: inv.id,
        head: feeHeadMap.get(inv.feeHeadId).name,
        month: inv.month,
        period: feeHeadMap.get(inv.feeHeadId).type === "MONTHLY" ? monthLabel(inv.month) : "One time",
        amount: inv.amount,
        discount: inv.discount,
        paid,
        due,
        status: due === 0 ? "PAID" : paid > 0 ? "PARTIAL" : "DUE",
    };
}

/** Student ledger. Future: GET /api/fees/students/:id/ledger (guardian: /api/portal/fees) */
export async function studentLedger(studentId) {
    const s = db.students.find((x) => x.id === studentId);
    if (!s) return null;
    const en = enrollmentByStudent.get(studentId);
    const invoices = db.invoices.filter((i) => i.studentId === studentId).map(invoiceRow);
    const payments = db.payments
        .filter((p) => p.studentId === studentId)
        .sort((a, b) => b.paidAt.localeCompare(a.paidAt))
        .map((p) => ({ ...p, heads: db.allocations.filter((a) => a.paymentId === p.id).map((a) => invoiceRow(db.invoices.find((i) => i.id === a.invoiceId)).head + " · " + invoiceRow(db.invoices.find((i) => i.id === a.invoiceId)).period) }));
    return {
        student: { id: s.id, name: s.name, studentUid: s.studentUid, section: sectionLabel(en.sectionId), roll: en.roll, guardianPhone: s.guardianPhone },
        invoices,
        payments,
        totals: {
            billed: invoices.reduce((a, i) => a + i.amount - i.discount, 0),
            paid: payments.filter((p) => p.status === "VALID").reduce((a, p) => a + p.amount, 0),
            due: invoices.reduce((a, i) => a + i.due, 0),
            discount: invoices.reduce((a, i) => a + i.discount, 0),
        },
    };
}

/** Due list. Future: GET /api/fees/dues?classId= */
export async function dueList() {
    const map = new Map();
    for (const inv of db.invoices) {
        const due = invoiceDue(inv);
        if (!due) continue;
        const r = map.get(inv.studentId) ?? { months: new Set(), due: 0 };
        r.due += due;
        if (feeHeadMap.get(inv.feeHeadId).type === "MONTHLY") r.months.add(inv.month);
        map.set(inv.studentId, r);
    }
    return [...map.entries()]
        .map(([studentId, r]) => {
            const s = db.students.find((x) => x.id === studentId);
            const en = enrollmentByStudent.get(studentId);
            return {
                studentId,
                studentUid: s.studentUid,
                name: s.name,
                classId: en.classId,
                classOrder: classMap.get(en.classId).order,
                section: sectionLabel(en.sectionId),
                roll: en.roll,
                guardianPhone: s.guardianPhone,
                monthsDue: r.months.size,
                due: r.due,
            };
        })
        .sort((a, b) => b.due - a.due);
}

/** Payments register. Future: GET /api/fees/payments?from=&to= */
export async function listPayments({ limit = 400 } = {}) {
    return [...db.payments]
        .sort((a, b) => b.paidAt.localeCompare(a.paidAt))
        .slice(0, limit)
        .map((p) => {
            const s = db.students.find((x) => x.id === p.studentId);
            const en = enrollmentByStudent.get(p.studentId);
            return { id: p.id, receiptNo: p.receiptNo, paidAt: p.paidAt, amount: p.amount, method: p.method, status: p.status, studentId: s.id, name: s.name, section: sectionLabel(en.sectionId), roll: en.roll, tranId: p.tranId };
        });
}

/** Receipt. Future: GET /api/fees/payments/:id (PDF rendered by the worker) */
export async function getReceipt(paymentId) {
    const p = db.payments.find((x) => x.id === paymentId);
    if (!p) return null;
    const ledger = await studentLedger(p.studentId);
    const lines = db.allocations.filter((a) => a.paymentId === p.id).map((a) => {
        const inv = db.invoices.find((i) => i.id === a.invoiceId);
        return { head: feeHeadMap.get(inv.feeHeadId).name, period: feeHeadMap.get(inv.feeHeadId).type === "MONTHLY" ? monthLabel(inv.month) : "One time", amount: a.amount };
    });
    return { payment: p, student: ledger.student, lines, collectedBy: p.collectedById === "usr-accounts" ? "Accounts Desk" : p.collectedById === "usr-office" ? "Office Desk" : "Online (gateway)" };
}

/** Collection totals. Future: GET /api/fees/summary */
export async function feeSummary() {
    const valid = db.payments.filter((p) => p.status === "VALID");
    const month = TODAY.slice(0, 7);
    const byMonth = [];
    for (let m = 1; m <= Number(month.slice(5)); m++) {
        const ym = `2026-${String(m).padStart(2, "0")}`;
        byMonth.push({ label: MONTH_NAMES[m - 1], value: valid.filter((p) => p.paidAt.startsWith(ym)).reduce((a, p) => a + p.amount, 0) });
    }
    const today = valid.filter((p) => p.paidAt.startsWith(TODAY));
    const totalDue = db.invoices.reduce((a, i) => a + invoiceDue(i), 0);
    return {
        today: today.reduce((a, p) => a + p.amount, 0),
        todayCount: today.length,
        thisMonth: valid.filter((p) => p.paidAt.startsWith(month)).reduce((a, p) => a + p.amount, 0),
        totalDue,
        defaulters: new Set(db.invoices.filter((i) => invoiceDue(i) > 0).map((i) => i.studentId)).size,
        byMonth,
        methods: ["CASH", "BKASH", "CARD"].map((m) => ({ label: m === "BKASH" ? "bKash" : m === "CARD" ? "Card" : "Cash", value: valid.filter((p) => p.method === m && p.paidAt.startsWith(month)).reduce((a, p) => a + p.amount, 0) })),
    };
}

/** Fee structure. Future: GET /api/fees/structures?sessionId= */
export async function feeStructure() {
    return db.classes.map((c) => ({
        classId: c.id,
        className: c.name,
        heads: db.feeHeads.map((h) => ({ head: h.name, type: h.type, amount: db.feeStructures.find((f) => f.classId === c.id && f.feeHeadId === h.id)?.amount ?? 0 })),
    }));
}
