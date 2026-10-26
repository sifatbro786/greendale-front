"use client";

import { Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const noop = () => () => {};

import { WhatsAppIcon } from "./SocialIcons";

export default function MobileMenu({ navigation, quickLinks, phone }) {
    const [open, setOpen] = useState(false);
    // true only in the browser, after hydration (no SSR/CSR mismatch)
    const isClient = useSyncExternalStore(noop, () => true, () => false);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open]);

    const close = () => setOpen(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="grid size-11 place-items-center rounded-full border border-line bg-white text-ink lg:hidden"
                aria-label="Open menu"
                aria-expanded={open}
                aria-controls="mobile-menu"
            >
                <Menu className="size-5" aria-hidden="true" />
            </button>

            {/* Portal to <body>: the sticky header uses backdrop-filter, which would otherwise trap this fixed overlay inside the 72px bar. */}
            {isClient &&
                createPortal(
            <div
                className={`fixed inset-0 z-50 overflow-hidden transition-[visibility] duration-300 lg:hidden ${open ? "visible" : "pointer-events-none invisible"}`}
                aria-hidden={!open}
            >
                <div
                    onClick={close}
                    className={`absolute inset-0 bg-ink/40 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
                />
                <div
                    id="mobile-menu"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menu"
                    className={`absolute top-0 right-0 flex h-full w-[min(88vw,380px)] flex-col bg-paper shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
                >
                    <div className="flex h-[72px] items-center justify-between border-b border-line px-5">
                        <span className="text-sm font-semibold tracking-wide text-ink-soft uppercase">Menu</span>
                        <button
                            type="button"
                            onClick={close}
                            className="grid size-11 place-items-center rounded-full bg-white text-ink"
                            aria-label="Close menu"
                            tabIndex={open ? 0 : -1}
                        >
                            <X className="size-5" aria-hidden="true" />
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto px-5 py-4" aria-label="Mobile">
                        <ul className="space-y-1">
                            <li>
                                <Link href="/" onClick={close} tabIndex={open ? 0 : -1} className="block rounded-xl px-3 py-3 text-[17px] font-semibold text-ink">
                                    Home
                                </Link>
                            </li>
                            {navigation.map((item) => (
                                <li key={item.label}>
                                    {item.children ? (
                                        <details className="group">
                                            <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-3 py-3 text-[17px] font-semibold text-ink [&::-webkit-details-marker]:hidden" tabIndex={open ? 0 : -1}>
                                                {item.label}
                                                <span className="text-xl leading-none text-brand transition-transform group-open:rotate-45">+</span>
                                            </summary>
                                            <ul className="mb-2 ml-3 border-l-2 border-brand-soft pl-3">
                                                {item.children.map((c) => (
                                                    <li key={c.href}>
                                                        <Link href={c.href} onClick={close} tabIndex={open ? 0 : -1} className="block rounded-lg px-3 py-2.5 text-[15.5px] text-ink-soft">
                                                            {c.label}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </details>
                                    ) : (
                                        <Link href={item.href} onClick={close} tabIndex={open ? 0 : -1} className="block rounded-xl px-3 py-3 text-[17px] font-semibold text-ink">
                                            {item.label}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="space-y-2 border-t border-line p-5">
                        <div className="grid grid-cols-2 gap-2">
                            {quickLinks.map((q, i) => (
                                <Link key={q.href} href={q.href} onClick={close} tabIndex={open ? 0 : -1} className={i ? "btn-primary" : "btn-ghost"}>
                                    {q.label}
                                </Link>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <a href={phone.phoneHref} tabIndex={open ? 0 : -1} className="btn bg-brand-soft text-brand-deep">
                                <Phone className="size-4" aria-hidden="true" /> Call
                            </a>
                            <a href={phone.whatsappHref} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1} className="btn bg-[#25D366] text-white">
                                <WhatsAppIcon className="size-4" /> WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>,
                    document.body,
                )}
        </>
    );
}
