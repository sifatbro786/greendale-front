import "server-only";

import { apiData } from "@/lib/api/server";

/**
 * Live implementation of lib/dashboard/comms. Ported so far: listAudit (Step 2b).
 * Notices, CMS overview and SMS land in Steps 2c / 3.
 */

/** Newest 500 entries; the table filters and pages them in the browser. */
export const listAudit = () => apiData("/api/audit?limit=500");
