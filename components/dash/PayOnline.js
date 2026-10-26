"use client";

import { CreditCard, Smartphone } from "lucide-react";
import { useState } from "react";

import Modal from "./Modal";
import { useToast } from "./Toast";

/**
 * Online payment (PRD §10.3). Phase 2: POST /api/payments/session → redirect to SSLCommerz / bKash.
 * Success is recorded ONLY from the gateway IPN + validation API (idempotent on tran_id), never from this page.
 */
export default function PayOnline({ due }) {
    const [open, setOpen] = useState(false);
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
                            onClick={() => {
                                setOpen(false);
                                toast("Demo: you would be sent to the secure payment page. The receipt appears here once the gateway confirms.", { title: "Redirecting to gateway", tone: "info" });
                            }}
                        >
                            Continue
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
