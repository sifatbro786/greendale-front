"use client";

import { Send } from "lucide-react";
import { useMemo, useState } from "react";

import { useToast } from "./Toast";

/** GSM-7 basic set; anything else (e.g. Bangla) makes the SMS Unicode: 70 chars (67 per part). */
const GSM = /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&'()*+,\-./0-9:;<=>?¡A-ZÄÖÑÜ§¿a-zäöñüà^{}\\[~\]|€]*$/;

export function smsSegments(text) {
    const unicode = !GSM.test(text);
    const single = unicode ? 70 : 160;
    const multi = unicode ? 67 : 153;
    const len = [...text].length;
    return { unicode, len, segments: len === 0 ? 0 : len <= single ? 1 : Math.ceil(len / multi), perSegment: len <= single ? single : multi };
}

/**
 * SMS composer with recipients, segment count and credits BEFORE sending (PRD §6.8).
 * Phase 2: POST /api/sms/send { audience, templateId?, body } → jobs on the sms queue, 3 retries with backoff.
 */
export default function SmsComposer({ audiences, templates, balance }) {
    const [audience, setAudience] = useState(audiences[0].value);
    const [body, setBody] = useState(templates[0].body);
    const toast = useToast();
    const seg = useMemo(() => smsSegments(body), [body]);
    const count = audiences.find((a) => a.value === audience)?.count ?? 0;
    const credits = seg.segments * count;

    return (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-line bg-white p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <label>
                        <span className="text-[13px] font-medium text-ink-soft">Send to</span>
                        <select value={audience} onChange={(e) => setAudience(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 text-[15px]">
                            {audiences.map((a) => (
                                <option key={a.value} value={a.value}>
                                    {a.label} ({a.count})
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <span className="text-[13px] font-medium text-ink-soft">Template</span>
                        <select onChange={(e) => setBody(templates.find((t) => t.id === e.target.value)?.body ?? "")} className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 text-[15px]">
                            {templates.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                            <option value="">Blank message</option>
                        </select>
                    </label>
                </div>
                <label className="mt-4 block">
                    <span className="text-[13px] font-medium text-ink-soft">Message</span>
                    <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} className="mt-1 block w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" />
                </label>
                <p className="mt-2 text-[13px] text-ink-soft">
                    Variables like <code className="rounded bg-paper px-1">{"{student_name}"}</code> and <code className="rounded bg-paper px-1">{"{due_amount}"}</code> are filled per guardian.
                </p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-5">
                <h2 className="font-semibold text-ink">Before you send</h2>
                <dl className="mt-4 space-y-3 text-[14.5px]">
                    <div className="flex justify-between">
                        <dt className="text-ink-soft">Recipients</dt>
                        <dd className="font-semibold tabular-nums">{count}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-ink-soft">Characters</dt>
                        <dd className="font-semibold tabular-nums">
                            {seg.len} {seg.unicode ? "(Unicode / Bangla)" : "(English)"}
                        </dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-ink-soft">SMS per guardian</dt>
                        <dd className="font-semibold tabular-nums">
                            {seg.segments} × {seg.perSegment} chars
                        </dd>
                    </div>
                    <div className="flex justify-between border-t border-line pt-3">
                        <dt className="text-ink-soft">Estimated credits</dt>
                        <dd className="text-lg font-semibold tabular-nums">{credits}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-ink-soft">Balance after</dt>
                        <dd className={`font-semibold tabular-nums ${balance - credits < 0 ? "text-coral" : ""}`}>{balance - credits}</dd>
                    </div>
                </dl>
                <button type="button" disabled={!seg.len} onClick={() => toast(`Demo: ${count} messages would be queued (${credits} credits).`, { title: "SMS queued", tone: "info" })} className="btn-primary mt-5 w-full disabled:opacity-50">
                    <Send className="size-4" aria-hidden="true" /> Send to {count} guardians
                </button>
            </div>
        </div>
    );
}
