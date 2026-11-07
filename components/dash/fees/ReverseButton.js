"use client";

import { useState } from "react";

import { errorText, field, fieldBorder, label } from "../admin/fields";
import { useApiAction } from "../academics/useApiAction";
import Modal from "../Modal";

/** Reverse a payment with a reason (POST /api/fees/payments/:id/reverse). The receipt itself is kept. */
export default function ReverseButton({ paymentId, receiptNo, demo = false }) {
    const { busy, run } = useApiAction({ demo });
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const short = reason.trim().length < 5;
    async function submit() {
        const r = await run(`/api/fees/payments/${paymentId}/reverse`, "POST", { reason: reason.trim() }, { success: `Receipt ${receiptNo} is reversed. Its dues are open again.` });
        if (r || demo) setOpen(false);
    }
    return (
        <>
            <button type="button" className="btn-ghost min-h-10 text-[14px] text-coral" onClick={() => setOpen(true)}>
                Reverse
            </button>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title={`Reverse ${receiptNo}?`}
                size="sm"
                footer={
                    <>
                        <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={() => setOpen(false)}>
                            Cancel
                        </button>
                        <button type="button" className="btn-primary min-h-10 bg-coral text-[14px] hover:bg-coral/90" disabled={busy || short} onClick={submit}>
                            Reverse payment
                        </button>
                    </>
                }
            >
                <p className="text-[14.5px] text-ink">The receipt stays in the register marked Reversed, the money stops counting and the dues become payable again. This is written to the audit log and cannot be undone.</p>
                <label className="mt-4 block">
                    <span className={label}>Reason</span>
                    <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Wrong student selected" className={`${field} ${fieldBorder(false)}`} maxLength={300} />
                    {reason && short && <span className={errorText}>Write at least a few words.</span>}
                </label>
            </Modal>
        </>
    );
}
