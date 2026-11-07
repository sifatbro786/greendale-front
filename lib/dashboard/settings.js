import "server-only";

import { dispatcher } from "./_dispatch";

/** Demo/live switch (see ./_dispatch.js). Implementations: lib/demo/dashboard/settings.js lib/live/dashboard/settings.js */
const call = dispatcher("settings", () => import("@/lib/demo/dashboard/settings"), () => import("@/lib/live/dashboard/settings"));

export const getSettings = (...args) => call("getSettings", args);
