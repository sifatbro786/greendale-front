import Footer from "./Footer";
import Header from "./Header";
import NoticeTicker from "./NoticeTicker";

/** Header + notice ticker + footer for every public page (used by app/page.js and app/(public)/layout.js). */
export default function PublicShell({ children }) {
    return (
        <>
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
            >
                Skip to content
            </a>
            <Header />
            <NoticeTicker />
            <main id="main" className="flex-1">
                {children}
            </main>
            <Footer />
        </>
    );
}
