import Link from "next/link";

import Footer from "@/components/site/Footer";
import Header from "@/components/site/Header";

export const metadata = { title: "Page not found" };

export default function NotFound() {
    return (
        <>
            <Header />
            <main className="container-x flex flex-1 flex-col items-center justify-center py-24 text-center">
                <p className="text-[7rem] leading-none font-semibold text-brand/15 sm:text-[10rem]">404</p>
                <h1 className="mt-2 text-3xl font-semibold text-ink">Oops! This page went out to play.</h1>
                <p className="mt-3 max-w-md text-ink-soft">The page you are looking for does not exist or has moved.</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link href="/" className="btn-primary">Go to homepage</Link>
                    <Link href="/contact" className="btn-ghost">Contact the office</Link>
                </div>
            </main>
            <Footer />
        </>
    );
}
