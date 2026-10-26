/**
 * Fallback for URL-dependent page content (params are read inside <Suspense> so the
 * App Shell stays shared and navigation is instant — Next 16 Partial Prefetching).
 * Known slugs are prerendered, so visitors normally never see this.
 */
export default function PageSkeleton({ variant = "page" }) {
    return (
        <div aria-busy="true" aria-label="Loading" className="animate-pulse">
            {variant !== "detail" && (
                <div className="bg-brand-soft/70">
                    <div className="container-x py-12 sm:py-16">
                        <div className="h-3 w-40 rounded-full bg-ink/10" />
                        <div className="mt-6 h-10 w-3/4 max-w-xl rounded-xl bg-ink/10" />
                        <div className="mt-4 h-4 w-2/3 max-w-lg rounded-full bg-ink/10" />
                    </div>
                </div>
            )}
            <div className="container-x space-y-4 py-14">
                {variant === "detail" && <div className="h-10 w-3/4 max-w-xl rounded-xl bg-ink/10" />}
                <div className="h-4 w-full max-w-3xl rounded-full bg-ink/10" />
                <div className="h-4 w-11/12 max-w-3xl rounded-full bg-ink/10" />
                <div className="h-4 w-4/5 max-w-3xl rounded-full bg-ink/10" />
                <div className="mt-8 h-56 w-full max-w-4xl rounded-[1.5rem] bg-ink/10" />
            </div>
        </div>
    );
}
