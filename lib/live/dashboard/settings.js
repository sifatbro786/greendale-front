import "server-only";

import { apiData } from "@/lib/api/server";

/** Live implementation of lib/dashboard/settings (greendale-back modules/settings, settings.manage). */
export const getSettings = () => apiData("/api/settings");
