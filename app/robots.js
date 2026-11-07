import { school } from "@/config/school";
import { isDemo } from "@/lib/mode";

export default function robots() {
    const base = school.siteUrl.replace(/\/$/, "");
    // Non-production deployments (Vercel previews) and the demo (duplicate of the real site) must not be indexed.
    const isProd = !isDemo && (process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : process.env.NODE_ENV === "production");
    return {
        rules: isProd
            ? [{ userAgent: "*", allow: "/", disallow: ["/admin", "/portal", "/login", "/api/", "/internal/"] }]
            : [{ userAgent: "*", disallow: "/" }],
        sitemap: `${base}/sitemap.xml`,
    };
}
