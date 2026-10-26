import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { school } from "@/config/school";

import { Scallop } from "../ui/Decor";
import { FacebookIcon, WhatsAppIcon, YouTubeIcon } from "./SocialIcons";

const columns = [
    {
        title: "School",
        links: [
            { label: "Introduction", href: "/about/introduction" },
            { label: "Chairman's Message", href: "/about/chairman-message" },
            { label: "Vision & Mission", href: "/about/vision-mission" },
            { label: "Facilities", href: "/facilities" },
            { label: "Teachers & Staff", href: "/teachers" },
        ],
    },
    {
        title: "Families",
        links: [
            { label: "Admission", href: "/admission/information" },
            { label: "Our Classes", href: "/academics/classes" },
            { label: "Student Corner", href: "/student-corner" },
            { label: "Online Result", href: "/result" },
            { label: "Portal Login", href: "/login" },
        ],
    },
    {
        title: "Updates",
        links: [
            { label: "Notice Board", href: "/notices" },
            { label: "News & Events", href: "/news" },
            { label: "Gallery", href: "/gallery" },
            { label: "Contact", href: "/contact" },
        ],
    },
];

export default function Footer() {
    const c = school.contact;
    return (
        <footer className="mt-auto">
            <Scallop color="var(--brand-deep)" />
            <div className="paper-grain bg-brand-deep text-white">
                <div className="container-x grid gap-12 py-14 lg:grid-cols-[1.25fr_2fr] lg:py-20">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="grid size-16 place-items-center rounded-2xl bg-white p-1.5">
                                <Image src={school.logo.crest} alt="" width={school.logo.width} height={school.logo.height} className="h-full w-auto" />
                            </span>
                            <div className="leading-tight">
                                <p className="text-lg font-bold tracking-[0.06em]">GREENDALE</p>
                                <p className="text-sm text-white/70">English Version School</p>
                            </div>
                        </div>
                        <p className="mt-6 max-w-sm text-[15.5px] leading-relaxed text-white/75">{school.tagline}</p>

                        <ul className="mt-7 space-y-3 text-[15px] text-white/85">
                            <li className="flex gap-3">
                                <MapPin className="mt-0.5 size-4.5 shrink-0 text-sun" aria-hidden="true" />
                                <span>
                                    {c.addressLines[0]}
                                    <br />
                                    {c.addressLines[1]}
                                </span>
                            </li>
                            <li className="flex gap-3">
                                <Phone className="mt-0.5 size-4.5 shrink-0 text-sun" aria-hidden="true" />
                                <a href={c.phoneHref} className="hover:text-white">{c.phone}</a>
                            </li>
                            {c.email && (
                                <li className="flex gap-3">
                                    <Mail className="mt-0.5 size-4.5 shrink-0 text-sun" aria-hidden="true" />
                                    <a href={`mailto:${c.email}`} className="hover:text-white">{c.email}</a>
                                </li>
                            )}
                            {c.officeHours && (
                                <li className="flex gap-3">
                                    <Clock className="mt-0.5 size-4.5 shrink-0 text-sun" aria-hidden="true" />
                                    <span>{c.officeHours}</span>
                                </li>
                            )}
                        </ul>

                        <div className="mt-7 flex gap-2.5">
                            <a href={school.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                                <FacebookIcon className="size-5" />
                            </a>
                            <a href={school.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                                <YouTubeIcon className="size-5" />
                            </a>
                            <a href={c.whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                                <WhatsAppIcon className="size-5" />
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
                        {columns.map((col) => (
                            <div key={col.title}>
                                <p className="text-[13px] font-semibold tracking-wider text-sun uppercase">{col.title}</p>
                                <ul className="mt-4 space-y-1">
                                    {col.links.map((l) => (
                                        <li key={l.href}>
                                            <Link href={l.href} className="inline-block py-1.5 text-[15px] text-white/80 hover:text-white">
                                                {l.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-white/10">
                    <div className="container-x flex flex-col gap-2 py-5 text-[13.5px] text-white/60 md:flex-row md:items-center md:justify-between">
                        <p>
                            © {school.name} · EIIN {school.eiin}
                        </p>
                        <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-1">
                            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
                            <Link href="/terms" className="hover:text-white">Terms of Use</Link>
                        </nav>
                        <p>
                            Website by{" "}
                            <a href="https://strsltd.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white">
                                STR Solutions Ltd.
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
