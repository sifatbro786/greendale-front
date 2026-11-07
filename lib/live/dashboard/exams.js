import "server-only";

import { apiData, apiFetch } from "@/lib/api/server";

/** Live implementation of lib/dashboard/exams (greendale-back modules/exams; teacher and guardian scope in the API). */

/** null on 404 (outside scope / unknown), throws on anything else. */
async function maybe(path, what) {
    const r = await apiFetch(path);
    if (r.status === 404 || r.status === 400) return null;
    if (!r.ok) throw new Error(r.error?.message || `Could not load ${what}.`);
    return r.data;
}

export const listExams = () => apiData("/api/exams");
export const upcomingExams = () => apiData("/api/exams/upcoming");
export const getExam = (id) => maybe(`/api/exams/${encodeURIComponent(id)}`, "the exam");
/** Section + subject pairs the signed-in user may enter marks for (teacher: own assignments). */
export const marksOptions = () => apiData("/api/exams/marks-options");

export const getMarksSheet = (examId, sectionId, subjectId) => maybe(`/api/exams/${encodeURIComponent(examId)}/marks?sectionId=${sectionId}&subjectId=${subjectId}`, "the marks sheet");
export const getTabulation = (examId, sectionId) => maybe(`/api/exams/${encodeURIComponent(examId)}/tabulation?sectionId=${sectionId}`, "the tabulation");

export async function studentResults(studentId) {
    return (await maybe(`/api/exams/students/${encodeURIComponent(studentId)}/results`, "results")) ?? [];
}
export const studentMarksheet = (studentId, examId) => maybe(`/api/exams/students/${encodeURIComponent(studentId)}/results/${encodeURIComponent(examId)}`, "the marksheet");

/** Next exam, the class schedule and whether dues hold the card (threshold is a school setting). */
export const admitCard = (studentId) => maybe(`/api/exams/students/${encodeURIComponent(studentId)}/admit-card`, "the admit card");
