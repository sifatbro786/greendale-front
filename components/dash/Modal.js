"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

/** Accessible modal on the native <dialog> element (focus trap + Esc for free). */
export default function Modal({ open, onClose, title, children, footer, size = "md" }) {
    const ref = useRef(null);
    useEffect(() => {
        const d = ref.current;
        if (!d) return;
        if (open && !d.open) d.showModal();
        if (!open && d.open) d.close();
    }, [open]);
    const width = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" }[size];
    return (
        <dialog
            ref={ref}
            onClose={onClose}
            onClick={(e) => e.target === ref.current && onClose()}
            className={`m-auto w-[calc(100%-2rem)] ${width} rounded-2xl border border-line bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]`}
        >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h2 className="text-lg font-semibold">{title}</h2>
                <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full hover:bg-paper" aria-label="Close">
                    <X className="size-4.5" aria-hidden="true" />
                </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
            {footer && <div className="flex justify-end gap-2 border-t border-line bg-paper/60 px-5 py-3.5">{footer}</div>}
        </dialog>
    );
}
