import "server-only";

import { dispatcher } from "./_dispatch";

/** Demo/live switch (see ./_dispatch.js). Implementations: lib/demo/dashboard/exams.js lib/live/dashboard/exams.js */
const call = dispatcher("exams", () => import("@/lib/demo/dashboard/exams"), () => import("@/lib/live/dashboard/exams"));

export const EXAM_STATUSES = ["DRAFT", "MARKS_OPEN", "LOCKED", "PUBLISHED"];

export const listExams = (...args) => call("listExams", args);
export const getExam = (...args) => call("getExam", args);
export const marksOptions = (...args) => call("marksOptions", args);
export const getMarksSheet = (...args) => call("getMarksSheet", args);
export const getTabulation = (...args) => call("getTabulation", args);
export const studentResults = (...args) => call("studentResults", args);
export const studentMarksheet = (...args) => call("studentMarksheet", args);
export const upcomingExams = (...args) => call("upcomingExams", args);
export const admitCard = (...args) => call("admitCard", args);
