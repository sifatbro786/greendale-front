"use client";

import { CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
    const [items, setItems] = useState([]);
    const dismiss = useCallback((id) => setItems((s) => s.filter((t) => t.id !== id)), []);
    const toast = useCallback(
        (message, { tone = "success", title } = {}) => {
            const id = Math.random().toString(36).slice(2);
            setItems((s) => [...s.slice(-2), { id, message, tone, title }]);
            setTimeout(() => dismiss(id), 4200);
        },
        [dismiss],
    );
    return (
        <ToastCtx value={toast}>
            {children}
            <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 z-[80] flex w-[min(92vw,380px)] flex-col gap-2">
                {items.map((t) => {
                    const Ico = t.tone === "error" ? TriangleAlert : t.tone === "info" ? Info : CircleCheck;
                    const color = t.tone === "error" ? "text-coral" : t.tone === "info" ? "text-sky" : "text-brand";
                    return (
                        <div key={t.id} role="status" className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-line bg-white p-4 shadow-[0_16px_40px_-18px_rgba(21,36,27,.45)]">
                            <Ico className={`mt-0.5 size-5 shrink-0 ${color}`} aria-hidden="true" />
                            <div className="min-w-0 flex-1 text-[14px]">
                                {t.title && <p className="font-semibold text-ink">{t.title}</p>}
                                <p className="text-ink-soft">{t.message}</p>
                            </div>
                            <button type="button" onClick={() => dismiss(t.id)} className="rounded-md p-1 text-ink-soft hover:bg-paper" aria-label="Dismiss">
                                <X className="size-4" aria-hidden="true" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastCtx>
    );
}

export function useToast() {
    const t = useContext(ToastCtx);
    return t ?? (() => {});
}

/** Standard message for actions that will hit the API in Phase 2. */
export const DEMO_SAVED = "Demo mode: this works once the backend is connected. Nothing was saved.";
