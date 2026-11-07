import "server-only";

import { dispatcher } from "./_dispatch";

/** Demo/live switch (see ./_dispatch.js). Implementations: lib/demo/dashboard/routine.js (live: not ported yet) */
const call = dispatcher("routine", () => import("@/lib/demo/dashboard/routine"));

export const getRoutine = (...args) => call("getRoutine", args);
export const teacherToday = (...args) => call("teacherToday", args);
