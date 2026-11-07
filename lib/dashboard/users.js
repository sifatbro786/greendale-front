import "server-only";

import { dispatcher } from "./_dispatch";

/** Demo/live switch (see ./_dispatch.js). Implementations: lib/demo/dashboard/users.js, lib/live/dashboard/users.js */
const call = dispatcher("users", () => import("@/lib/demo/dashboard/users"), () => import("@/lib/live/dashboard/users"));

export const listUsers = (...args) => call("listUsers", args);
export const listRoles = (...args) => call("listRoles", args);
export const getUser = (...args) => call("getUser", args);
export const getRole = (...args) => call("getRole", args);
export const listStaffOptions = (...args) => call("listStaffOptions", args);
