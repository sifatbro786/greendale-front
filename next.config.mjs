/**
 * DATA_MODE (see lib/mode.js): demo (default, Vercel) or live (local dev + VPS, needs API_INTERNAL_URL).
 * Checked here so a misconfigured live build or start fails immediately instead of serving demo data.
 */
const DATA_MODE = process.env.DATA_MODE || "demo";
if (!["demo", "live"].includes(DATA_MODE)) throw new Error(`DATA_MODE must be "demo" or "live" (got "${DATA_MODE}")`);
const API_INTERNAL_URL = (process.env.API_INTERNAL_URL || "").replace(/\/+$/, "");
if (DATA_MODE === "live" && !/^https?:\/\/[^/]+$/.test(API_INTERNAL_URL)) {
    throw new Error("DATA_MODE=live needs API_INTERNAL_URL, e.g. http://127.0.0.1:4000 (no /api, no trailing slash)");
}

/** @type {import('next').NextConfig} */
const securityHeaders = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig = {
    cacheComponents: true,
    partialPrefetching: true,
    reactCompiler: true,
    poweredByHeader: false,
    images: {
        formats: ["image/avif", "image/webp"],
        qualities: [75, 85],
        remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
    },
    /**
     * Live mode: /api/* belongs to Express. On the VPS Nginx routes /api to :4000 before Next sees it;
     * locally (no Nginx) this rewrite does the same, bypassing the demo handlers in app/api.
     */
    async rewrites() {
        if (DATA_MODE !== "live") return [];
        return {
            beforeFiles: [
                { source: "/api/:path*", destination: `${API_INTERNAL_URL}/api/:path*` },
                // CMS uploads. On the VPS Nginx serves /uploads/public from disk before Next sees it.
                { source: "/uploads/public/:path*", destination: `${API_INTERNAL_URL}/uploads/public/:path*` },
            ],
        };
    },
    async headers() {
        return [
            { source: "/:path*", headers: securityHeaders },
            {
                source: "/videos/:path*",
                headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
            },
        ];
    },
    turbopack: {
        rules: {
            "*.css": {
                loaders: ["@tailwindcss/turbopack"],
                as: "*.css",
            },
        },
    },
};

export default nextConfig;
