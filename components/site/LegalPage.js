import { notFound } from "next/navigation";
import Link from "next/link";

import { getPage } from "@/lib/data";
import { formatDate } from "@/lib/format";

import HelpStrip from "./HelpStrip";
import PageHeader from "./PageHeader";
import RichText from "./RichText";

/** Shared renderer for /privacy and /terms (Page model, section "legal"). */
export default async function LegalPage({ slug }) {
    const page = await getPage("legal", slug);
    if (!page) notFound();
    const other = slug === "privacy" ? { href: "/terms", label: "Terms of Use" } : { href: "/privacy", label: "Privacy Policy" };

    return (
        <>
            <PageHeader title={page.title} summary={page.summary} tone="sky" crumbs={[{ label: page.title }]} />
            <div className="container-x max-w-3xl py-14 lg:py-20">
                <p className="mb-8 inline-flex rounded-full bg-white px-3.5 py-1.5 text-[13.5px] text-ink-soft ring-1 ring-line">
                    Last updated {formatDate(page.updatedAt, { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <RichText html={page.bodyHtml} />
                <p className="mt-10 text-[15px] text-ink-soft">
                    See also our{" "}
                    <Link href={other.href} className="font-semibold text-brand-deep underline-offset-4 hover:underline">
                        {other.label}
                    </Link>
                    .
                </p>
                <HelpStrip className="mt-12" title="Questions about this page? Talk to the school office." />
            </div>
        </>
    );
}

/** Metadata helper for the legal routes. */
export async function legalMetadata(slug) {
    const page = await getPage("legal", slug);
    if (!page) return {};
    return { title: page.title, description: page.summary, alternates: { canonical: `/${slug}` } };
}
