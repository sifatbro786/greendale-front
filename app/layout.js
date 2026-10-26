import localFont from "next/font/local";

import { school } from "@/config/school";

import "./globals.css";

/**
 * Google Sans (variable 400–700), self-hosted from @fontsource-variable/google-sans (OFL).
 * Self-hosting means builds never depend on reaching fonts.googleapis.com (VPS, CI, Vercel all identical).
 */
const googleSans = localFont({
    src: "./fonts/GoogleSans-Latin-Variable.woff2",
    variable: "--font-google-sans",
    weight: "400 700",
    style: "normal",
    display: "swap",
    fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
});

/** Theme tokens from config → CSS variables (consumed by @theme in globals.css). */
const t = school.theme;
const themeVars = {
    "--brand": t.brand,
    "--brand-deep": t.brandDeep,
    "--brand-soft": t.brandSoft,
    "--sun": t.sun,
    "--sun-soft": t.sunSoft,
    "--sky": t.sky,
    "--sky-soft": t.skySoft,
    "--coral": t.coral,
    "--coral-soft": t.coralSoft,
    "--paper": t.paper,
    "--ink": t.ink,
};

export const metadata = {
    metadataBase: new URL(school.siteUrl),
    title: {
        default: `${school.name} | Mirpur, Dhaka`,
        template: `%s | ${school.shortName} English Version School`,
    },
    description: school.description,
    applicationName: school.name,
    keywords: [
        "Greendale English Version School",
        "English Version school Mirpur",
        "school in Mirpur Dhaka",
        "Play Group admission Mirpur",
        "kindergarten Mirpur",
        "primary school Dhaka",
    ],
    openGraph: {
        type: "website",
        locale: "en_BD",
        siteName: school.name,
        title: school.name,
        description: school.description,
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: "/" },
};

export const viewport = {
    themeColor: t.brand,
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" data-scroll-behavior="smooth" className={`${googleSans.variable} h-full antialiased`} style={themeVars}>
            <body className="flex min-h-full flex-col font-sans" suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}
