/**
 * Data mode (decided 1 Nov 2026). Server-side env only, read at build time AND at start.
 * - demo (default, Vercel sales demo): static sample data, Next demo auth/contact handlers, no backend.
 * - live (local dev + VPS): every lib/data/* and lib/dashboard/* call goes to the Express API.
 * next.config.mjs fails the build/start when DATA_MODE=live has no API_INTERNAL_URL.
 * Never import this into a client component (process.env.DATA_MODE is not exposed to the browser).
 */
export const DATA_MODE = process.env.DATA_MODE === "live" ? "live" : "demo";
export const isLive = DATA_MODE === "live";
export const isDemo = !isLive;

/** e.g. http://127.0.0.1:4000 (no trailing slash, no /api) */
export const API_INTERNAL_URL = (process.env.API_INTERNAL_URL || "").replace(/\/+$/, "");

/** Cookie names shared with the API (greendale-back src/core/auth.js COOKIE). */
export const API_COOKIE = Object.freeze({ ACCESS: "gd_at", REFRESH: "gd_rt" });
