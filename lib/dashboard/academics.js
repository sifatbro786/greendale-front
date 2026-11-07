import "server-only";

import { dispatcher } from "./_dispatch";

/** Demo/live switch (see ./_dispatch.js). Implementations: lib/demo/dashboard/academics.js (live: not ported yet) */
const call = dispatcher("academics", () => import("@/lib/demo/dashboard/academics"));

export const listClasses = (...args) => call("listClasses", args);
export const listSectionOptions = (...args) => call("listSectionOptions", args);
export const listSessions = (...args) => call("listSessions", args);
export const listStaff = (...args) => call("listStaff", args);
export const getGradeScale = (...args) => call("getGradeScale", args);
export const teacherAssignments = (...args) => call("teacherAssignments", args);
export const teacherSections = (...args) => call("teacherSections", args);
