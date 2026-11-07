"use client";

import { CreditCard, Loader2, Smartphone } from "lucide-react";
import { useState } from "react";

import { api } from "@/lib/api/client";

import Modal from "./Modal";
import { useToast } from "./Toast";

/**
 * Online payment (PRD §10.3). Live: POST /api/payments/session → redirect to the SSLCommerz page
 * (bKash, Nagad, cards and mobile banking are chosen there). Success is recorded ONLY from the gateway
 * IPN + validation API (idempotent on tran_id), never from this page.
 */
export default function PayOnline({ due, demo = false }) {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [method, setMethod] = useState("bkash");
    const toast = useToast();
    const money = `৳ ${new Intl.NumberFormat("en-IN").format(due)}`;
    if (!due) return null;
    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className="btn-primary min-h-10 text-[14px]">
                Pay {money} online
            </button>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Pay online"
                size="sm"
                footer={
                    <>
                        <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={() => setOpen(false)}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn-primary min-h-10 text-[14px]"
                            disabled={busy}
                            onClick={async () => {
                                if (demo) {
                                    setOpen(false);
                                    return toast("Demo: you would be sent to the secure payment page. The receipt appears here once the gateway confirms.", { title: "Redirecting to gateway", tone: "info" });
                                }
                                setBusy(true);
                                const r = await api("/api/payments/session", { method: "POST", body: {} });
                                if (!r.ok) {
                                    setBusy(false);
                                    return toast(r.error.message, { title: "Online payment", tone: "error" });
                                }
                                window.location.assign(r.data.redirectUrl);
                            }}
                        >
                            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />} Continue
                        </button>
                    </>
                }
            >
                <p className="text-[14.5px] text-ink-soft">
                    Amount: <b className="text-ink">{money}</b> (all current dues)
                </p>
                <div className="mt-4 grid gap-2">
                    {[
                        ["bkash", "bKash", Smartphone],
                        ["card", "Card / mobile banking (SSLCommerz)", CreditCard],
                    ].map(([v, l, Ico]) => (
                        <label key={v} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 ${method === v ? "border-brand bg-brand-soft/50" : "border-line"}`}>
                            <input type="radio" name="method" checked={method === v} onChange={() => setMethod(v)} className="accent-[var(--brand)]" />
                            <Ico className="size-5 text-brand" aria-hidden="true" />
                            <span className="font-medium">{l}</span>
                        </label>
                    ))}
                </div>
                <p className="mt-4 text-[12.5px] text-ink-soft">Gateway service charges may apply. The school never sees your card or wallet PIN.</p>
            </Modal>
        </>
    );
}
