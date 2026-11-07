import "server-only";

import { dispatcher } from "./_dispatch";

/** Demo/live switch (see ./_dispatch.js). Implementations: lib/demo/dashboard/students.js lib/live/dashboard/students.js */
const call = dispatcher("students", () => import("@/lib/demo/dashboard/students"), () => import("@/lib/live/dashboard/students"));

export const listStudents = (...args) => call("listStudents", args);
export const getStudent = (...args) => call("getStudent", args);
export const studentCounts = (...args) => call("studentCounts", args);
