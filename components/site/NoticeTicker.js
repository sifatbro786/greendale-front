import { Megaphone } from "lucide-react";
import Link from "next/link";

import { getNotices } from "@/lib/data";

/** Latest notices scrolling under the header (CSS-only marquee, pauses on hover/focus). */
export default async function NoticeTicker() {
    const notices = await getNotices({ limit: 6 });
    if (!notices.length) return null;
    const items = [...notices, ...notices]; // duplicated for a seamless loop
    return (
        <div className="relative z-10 border-b border-[#e9c63a] bg-sun text-ink">
            <div className="container-x flex h-11 items-center gap-3">
                <Link
                    href="/notices"
                    className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[12.5px] font-semibold tracking-wide text-sun uppercase"
                >
                    <Megaphone className="size-3.5" aria-hidden="true" />
                    Notice
                </Link>
                <div className="group relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)]">
                    <ul className="flex w-max animate-marquee gap-10 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
                        {items.map((n, i) => (
                            <li key={`${n.id}-${i}`} aria-hidden={i >= notices.length ? true : undefined}>
                                <Link
                                    href={`/notices/${n.slug}`}
                                    tabIndex={i >= notices.length ? -1 : undefined}
                                    className="flex items-center gap-2 text-[14.5px] font-medium whitespace-nowrap hover:underline"
                                >
                                    <span className="size-1.5 rounded-full bg-brand-deep" aria-hidden="true" />
                                    {n.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
