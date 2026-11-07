import "server-only";

import { dispatcher } from "./_dispatch";

/** Demo/live switch (see ./_dispatch.js). Implementations: lib/demo/dashboard/academics.js lib/live/dashboard/academics.js */
const call = dispatcher("academics", () => import("@/lib/demo/dashboard/academics"), () => import("@/lib/live/dashboard/academics"));

export const listClasses = (...args) => call("listClasses", args);
export const listSectionOptions = (...args) => call("listSectionOptions", args);
export const listSessions = (...args) => call("listSessions", args);
export const listStaff = (...args) => call("listStaff", args);
export const getGradeScale = (...args) => call("getGradeScale", args);
export const teacherAssignments = (...args) => call("teacherAssignments", args);
export const teacherSections = (...args) => call("teacherSections", args);
export const getClassDetail = (...args) => call("getClassDetail", args);
export const getStaffMember = (...args) => call("getStaffMember", args);
