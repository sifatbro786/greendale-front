"use client";

import { Bell, ChevronsUpDown, ExternalLink, LogOut, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Icon } from "./icons";
import { ToastProvider } from "./Toast";

/**
 * App shell for /admin and /portal: sidebar (drawer on phones), top bar, demo banner, toasts.
 * @param {{ user: { name: string, roleLabel: string, subtitle?: string }, nav: { label: string, items: { label: string, href: string, icon: string, exact?: boolean }[] }[], area: "admin"|"portal", logo: { src: string, width: number, height: number }, children: React.ReactNode }} props
 */
export default function DashShell({ user, nav, area, logo, children }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    const isActive = (item) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`));

    const sidebar = (
        <div className="flex h-full flex-col">
            <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-line px-5">
                <Image src={logo.src} alt="" width={logo.width} height={logo.height} className="h-9 w-auto" />
                <div className="leading-tight">
                    <p className="text-[15px] font-bold tracking-[0.05em] text-brand-deep">GREENDALE</p>
                    <p className="text-[11.5px] font-medium text-ink-soft">{area === "admin" ? "School Management" : "Student Portal"}</p>
                </div>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={area === "admin" ? "Admin" : "Portal"}>
                {nav.map((g) => (
                    <div key={g.label} className="mb-5">
                        <p className="px-3 pb-1.5 text-[11px] font-semibold tracking-[0.08em] text-ink-soft/80 uppercase">{g.label}</p>
                        <ul className="space-y-0.5">
                            {g.items.map((item) => {
                                const active = isActive(item);
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setOpen(false)}
                                            aria-current={active ? "page" : undefined}
                                            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] transition-colors ${
                                                active ? "bg-brand text-white shadow-[0_2px_0_var(--brand-deep)]" : "text-ink hover:bg-brand-soft hover:text-brand-deep"
                                            }`}
                                        >
                                            <Icon name={item.icon} className={`size-[18px] ${active ? "text-white" : "text-ink-soft group-hover:text-brand"}`} />
                                            <span className="font-medium">{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
            <div className="border-t border-line p-3">
                <Link href="/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13.5px] text-ink-soft hover:bg-paper hover:text-ink">
                    <ExternalLink className="size-4" aria-hidden="true" /> View website
                </Link>
            </div>
        </div>
    );

    return (
        <ToastProvider>
            <div className="min-h-screen bg-[#F6F4EE] text-ink print:bg-white">
                {/* Sidebar — desktop */}
                <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-white lg:block print:!hidden">{sidebar}</aside>

                {/* Sidebar — mobile drawer */}
                <div className={`fixed inset-0 z-50 lg:hidden ${open ? "visible" : "invisible pointer-events-none"}`}>
                    <div className={`absolute inset-0 bg-ink/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
                    <aside className={`absolute inset-y-0 left-0 w-[min(84vw,300px)] bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
                        <button type="button" onClick={() => setOpen(false)} className="absolute top-3.5 right-3 grid size-9 place-items-center rounded-full hover:bg-paper" aria-label="Close menu">
                            <X className="size-5" aria-hidden="true" />
                        </button>
                        {sidebar}
                    </aside>
                </div>

                <div className="lg:pl-64 print:!pl-0">
                    <div className="bg-sun px-4 py-1.5 text-center text-[12.5px] font-medium text-ink print:hidden">
                        Demo mode · sample data · changes are not saved
                    </div>
                    <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur print:hidden">
                        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
                            <button type="button" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-xl border border-line lg:hidden" aria-label="Open menu">
                                <Menu className="size-5" aria-hidden="true" />
                            </button>
                            <p className="hidden text-[14px] text-ink-soft md:block">
                                Session <span className="font-semibold text-ink">2026</span>
                            </p>
                            <div className="ml-auto flex items-center gap-2">
                                <Link href={area === "admin" ? "/admin/notices" : "/portal/notices"} className="relative grid size-10 place-items-center rounded-xl text-ink-soft hover:bg-paper hover:text-ink" aria-label="Notices">
                                    <Bell className="size-5" aria-hidden="true" />
                                    <span className="absolute top-2 right-2 size-2 rounded-full bg-coral ring-2 ring-white" />
                                </Link>
                                <UserMenu user={user} />
                            </div>
                        </div>
                    </header>
                    <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">{children}</main>
                </div>
            </div>
        </ToastProvider>
    );
}

function UserMenu({ user }) {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
        document.addEventListener("pointerdown", close);
        return () => document.removeEventListener("pointerdown", close);
    }, [open]);

    async function logout() {
        setBusy(true);
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        // Full page load: drops every cached route/state from the signed-in session.
        window.location.replace("/login");
    }

    const initials = user.name
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase();

    return (
        <div ref={ref} className="relative">
            <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex items-center gap-2.5 rounded-xl py-1.5 pr-2 pl-1.5 hover:bg-paper">
                <span className="grid size-9 place-items-center rounded-full bg-brand text-[13px] font-semibold text-white">{initials}</span>
                <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-[14px] font-semibold text-ink">{user.name}</span>
                    <span className="block text-[12px] text-ink-soft">{user.roleLabel}</span>
                </span>
                <ChevronsUpDown className="hidden size-4 text-ink-soft sm:block" aria-hidden="true" />
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-line bg-white p-2 shadow-[0_18px_40px_-18px_rgba(21,36,27,.4)]">
                    <div className="px-3 py-2.5">
                        <p className="font-semibold text-ink">{user.name}</p>
                        <p className="text-[13px] text-ink-soft">{user.subtitle ?? user.roleLabel}</p>
                    </div>
                    <div className="my-1 border-t border-line" />
                    <button type="button" onClick={logout} disabled={busy} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] text-ink hover:bg-coral-soft hover:text-coral">
                        <LogOut className="size-4" aria-hidden="true" />
                        {busy ? "Signing out…" : "Sign out"}
                    </button>
                </div>
            )}
        </div>
    );
}
