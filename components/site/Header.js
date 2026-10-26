import { ChevronDown, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { navigation, quickLinks, school } from "@/config/school";

import MobileMenu from "./MobileMenu";
import { FacebookIcon, YouTubeIcon } from "./SocialIcons";

export function Logo({ compact = false, invert = false }) {
    return (
        <Link href="/" className="group flex items-center gap-2.5" aria-label={`${school.name} home`}>
            <Image
                src={school.logo.crest}
                alt=""
                width={school.logo.width}
                height={school.logo.height}
                className={`${compact ? "h-10" : "h-11 sm:h-12"} w-auto`}
                priority
            />
            <span className="leading-none whitespace-nowrap">
                <span className={`block text-[19px] font-bold tracking-[0.06em] ${invert ? "text-white" : "text-brand-deep"}`}>
                    GREENDALE
                </span>
                <span className={`mt-1 block text-[11.5px] font-medium tracking-wide ${invert ? "text-white/70" : "text-ink-soft"}`}>
                    English Version School
                </span>
            </span>
        </Link>
    );
}

export default function Header() {
    return (
        <header className="sticky -top-9 z-40">
            {/* Utility strip */}
            <div className="bg-brand-deep text-[13px] text-white/85">
                <div className="container-x flex h-9 items-center justify-between gap-4">
                    <p className="truncate">
                        <span className="font-semibold text-sun">EIIN {school.eiin}</span>
                        <span className="mx-2 text-white/30">|</span>
                        <span className="hidden sm:inline">{school.levels} · </span>
                        {school.contact.addressShort}
                    </p>
                    <div className="flex shrink-0 items-center gap-4">
                        <a href={school.contact.phoneHref} className="hidden items-center gap-1.5 hover:text-white md:flex">
                            <Phone className="size-3.5" aria-hidden="true" />
                            {school.contact.phone}
                        </a>
                        <a href={school.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook page" className="hover:text-white">
                            <FacebookIcon className="size-4" />
                        </a>
                        <a href={school.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube channel" className="hover:text-white">
                            <YouTubeIcon className="size-4" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Main bar */}
            <div className="border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
                <div className="container-x flex h-[72px] items-center justify-between gap-4">
                    <Logo />

                    <nav aria-label="Main" className="hidden lg:block">
                        <ul className="flex items-center gap-0.5">
                            {navigation.map((item) => (
                                <li key={item.label} className="group relative">
                                    <Link
                                        href={item.href}
                                        className="flex items-center gap-1 rounded-full px-2.5 py-2 text-[15px] font-medium whitespace-nowrap text-ink transition-colors hover:bg-brand-soft hover:text-brand-deep"
                                    >
                                        {item.label}
                                        {item.children && (
                                            <ChevronDown className="size-3.5 opacity-60 transition-transform group-hover:rotate-180" aria-hidden="true" />
                                        )}
                                    </Link>
                                    {item.children && (
                                        <div className="invisible absolute top-full left-0 pt-2 opacity-0 transition-all duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                                            <ul className="min-w-56 rounded-2xl border border-line bg-white p-2 shadow-[0_18px_40px_-18px_rgba(21,36,27,.35)]">
                                                {item.children.map((c) => (
                                                    <li key={c.href}>
                                                        <Link
                                                            href={c.href}
                                                            className="block rounded-xl px-3 py-2.5 text-[14.5px] text-ink hover:bg-brand-soft hover:text-brand-deep"
                                                        >
                                                            {c.label}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="flex items-center gap-2">
                        <Link href={quickLinks[0].href} className="btn-ghost hidden min-h-10 px-4 text-sm whitespace-nowrap 2xl:inline-flex">
                            {quickLinks[0].label}
                        </Link>
                        <Link href={quickLinks[1].href} className="btn-primary hidden min-h-10 px-4 text-sm whitespace-nowrap sm:inline-flex">
                            {quickLinks[1].label}
                        </Link>
                        <MobileMenu navigation={navigation} quickLinks={quickLinks} phone={school.contact} />
                    </div>
                </div>
            </div>
        </header>
    );
}
