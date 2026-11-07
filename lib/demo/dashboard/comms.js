import "server-only";

import { noticeCategories, notices as publicNotices } from "@/content/notices";
import { news } from "@/content/news";
import { albums } from "@/content/gallery";
import { pages } from "@/content/pages";

import { db, enrollmentByStudent, sectionLabel } from "./_shared";

/** Staff + guardian notices. Future: GET /api/notices?audience= */
export async function listStaffNotices({ classId } = {}) {
    return db.staffNotices
        .filter((n) => n.audience === "STAFF" || n.audience === "ALL" || (classId && n.audience === `CLASS:${classId}`))
        .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.publishedAt.localeCompare(a.publishedAt));
}

/** Notices a guardian sees: school-wide + class notices + public website notices. */
export async function portalNotices(studentId) {
    const en = enrollmentByStudent.get(studentId);
    const internal = db.staffNotices
        .filter((n) => n.audience === "ALL" || n.audience === `CLASS:${en.classId}`)
        .map((n) => ({ id: n.id, title: n.title, body: n.body, publishedAt: n.publishedAt, scope: n.audience === "ALL" ? "School" : "Your class", pinned: n.pinned }));
    const pub = publicNotices.map((n) => ({ id: n.id, title: n.title, body: n.excerpt, publishedAt: n.publishedAt, scope: "Website", pinned: n.pinned, slug: n.slug }));
    return [...internal, ...pub].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** Website CMS overview. Future: GET /api/cms/* */
export async function cmsOverview() {
    return {
        notices: publicNotices.map((n) => ({ id: n.id, title: n.title, category: noticeCategories.find((c) => c.value === n.category)?.label ?? n.category, publishedAt: n.publishedAt, pinned: n.pinned, status: "Published", slug: n.slug })),
        news: news.map((p) => ({ id: p.id, title: p.title, publishedAt: p.publishedAt, slug: p.slug, cover: p.cover.src })),
        albums: albums.map((a) => ({ id: a.id, title: a.title, count: a.images.length, cover: a.cover.src, slug: a.slug, date: a.date })),
        pages: pages.map((p) => ({ id: `${p.section}/${p.slug}`, title: p.title, section: p.section, updatedAt: p.updatedAt, href: p.section === "legal" ? `/${p.slug}` : `/${p.section}/${p.slug}` })),
        messages: [
            { id: "cm-1", name: "Rashida Akter", phone: "01712-334455", subject: "Admission", message: "Is admission open for Nursery? What documents are needed?", receivedAt: "2026-10-25T19:12:00+06:00", replied: false },
            { id: "cm-2", name: "Md. Faruk Hossain", phone: "01819-221100", subject: "Fees", message: "Can I pay the monthly fee by bKash?", receivedAt: "2026-10-24T11:40:00+06:00", replied: true },
            { id: "cm-3", name: "Sultana Razia", phone: "01911-556677", subject: "General", message: "What time does school end for Class II?", receivedAt: "2026-10-22T08:05:00+06:00", replied: true },
        ],
    };
}

/** Future: GET /api/sms/templates, /api/sms/logs, /api/sms/balance */
export async function smsOverview() {
    return {
        balance: 4820,
        templates: db.smsTemplates,
        logs: db.smsLogs.map((l) => {
            const s = db.students.find((x) => x.id === l.studentId);
            return { ...l, studentName: s?.name ?? "—", section: s ? sectionLabel(enrollmentByStudent.get(s.id).sectionId) : "" };
        }),
        audiences: [
            { value: "all", label: "All guardians", count: db.students.filter((s) => s.status === "ACTIVE").length },
            ...db.sections.map((sec) => ({ value: sec.id, label: `Guardians of ${sectionLabel(sec.id)}`, count: db.enrollments.filter((e) => e.sectionId === sec.id).length })),
            { value: "dues", label: "Guardians with dues", count: new Set(db.invoices.map((i) => i.studentId)).size },
        ],
    };
}

/** Future: GET /api/audit?entity=&actor= */
export async function listAudit() {
    return [...db.auditLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
