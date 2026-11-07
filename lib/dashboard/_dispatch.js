import "server-only";

import { isLive } from "@/lib/mode";

/**
 * Demo / live switch for lib/dashboard/* (decided 1 Nov 2026).
 * Each lib/dashboard/<module>.js exports thin async wrappers that load the demo implementation
 * (lib/demo/dashboard/<module>.js) or the live one (lib/live/dashboard/<module>.js) on first call.
 * The import is dynamic, so a live server never evaluates the demo data generator and the demo
 * (Vercel) never loads API code. Return shapes are identical in both modes.
 *
 * A live module that does not implement a function yet throws NotConnectedError: the area error
 * boundary shows it (message visible in development only). Every module is live by Step 4.
 */
export class NotConnectedError extends Error {
    constructor(name) {
        super(`${name} is not connected to the API yet`);
        this.name = "NotConnectedError";
    }
}

/**
 * @param {string} module                      e.g. "users"
 * @param {() => Promise<object>} demo         () => import("@/lib/demo/dashboard/users")
 * @param {() => Promise<object>} [live]       () => import("@/lib/live/dashboard/users"); omit while not ported
 * @returns {(name: string, args: unknown[]) => Promise<any>}
 */
export function dispatcher(module, demo, live = async () => ({})) {
    return async (name, args) => {
        const impl = await (isLive ? live() : demo());
        const fn = impl[name];
        if (typeof fn !== "function") throw new NotConnectedError(`${module}.${name}`);
        return fn(...args);
    };
}
