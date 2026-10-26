import Link from "next/link";

/** Section side navigation (horizontal scroller on mobile, sticky list on desktop). */
export default function SideNav({ title, items, current }) {
    return (
        <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <p className="hidden text-[13px] font-semibold tracking-wider text-ink-soft uppercase lg:block">{title}</p>
            <nav aria-label={title} className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:mt-4 lg:overflow-visible lg:px-0">
                <ul className="flex gap-2 lg:flex-col lg:gap-1">
                    {items.map((it) => {
                        const active = it.href === current;
                        return (
                            <li key={it.href} className="shrink-0">
                                <Link
                                    href={it.href}
                                    aria-current={active ? "page" : undefined}
                                    className={`block rounded-full px-4 py-2 text-[15px] whitespace-nowrap transition-colors lg:rounded-xl lg:px-3.5 lg:py-2.5 ${
                                        active ? "bg-brand font-semibold text-white" : "border border-line bg-white text-ink hover:border-brand hover:text-brand lg:border-transparent lg:bg-transparent"
                                    }`}
                                >
                                    {it.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}
