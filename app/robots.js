import { school } from "@/config/school";

export default function robots() {
    const base = school.siteUrl.replace(/\/$/, "");
    // Non-production deployments (Vercel previews) must not be indexed.
    const isProd = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : process.env.NODE_ENV === "production";
    return {
        rules: isProd
            ? [{ userAgent: "*", allow: "/", disallow: ["/admin", "/portal", "/login", "/api/", "/internal/"] }]
            : [{ userAgent: "*", disallow: "/" }],
        sitemap: `${base}/sitemap.xml`,
    };
}
