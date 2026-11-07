"use client";

import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { api } from "@/lib/api/client";

import { DEMO_SAVED, useToast } from "./Toast";

/** GSM-7 basic set; anything else (e.g. Bangla) makes the SMS Unicode: 70 chars (67 per part). */
const GSM =
  /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&'()*+,\-./0-9:;<=>?¡A-ZÄÖÑÜ§¿a-zäöñüà^{}\\[~\]|€]*$/;

export function smsSegments(text) {
  const unicode = !GSM.test(text);
  const single = unicode ? 70 : 160;
  const multi = unicode ? 67 : 153;
  const len = [...text].length;
  return {
    unicode,
    len,
    segments: len === 0 ? 0 : len <= single ? 1 : Math.ceil(len / multi),
    perSegment: len <= single ? single : multi,
  };
}

/**
 * SMS composer with recipients, segment count and credits BEFORE sending (PRD §6.8).
 * POST /api/sms/send { audience, templateId?, body } → one job per guardian on the sms queue (3 retries).
 * The same message to the same guardian on the same day is skipped, so a double tap is harmless.
 * balance is null when the provider does not report it (log driver, or the gateway is unreachable).
 * @param {{ audiences: {value:string,label:string,count:number}[], templates: any[], balance: number|null, demo?: boolean }} props
 */
export default function SmsComposer({
  audiences,
  templates,
  balance,
  demo = false,
}) {
  const router = useRouter();
  const [audience, setAudience] = useState(audiences[0]?.value ?? "");
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [body, setBody] = useState(templates[0]?.body ?? "");
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const toast = useToast();
  const seg = useMemo(() => smsSegments(body), [body]);
  const count = audiences.find((a) => a.value === audience)?.count ?? 0;
  const credits = seg.segments * count;
  const known = typeof balance === "number";

  async function send() {
    if (!confirming) return setConfirming(true);
    setConfirming(false);
    if (demo)
      return toast(
        `${count} messages would be queued (${credits} credits). ${DEMO_SAVED}`,
        { title: "SMS queued", tone: "info" },
      );
    setBusy(true);
    const r = await api("/api/sms/send", {
      method: "POST",
      body: { audience, templateId: templateId || null, body },
    });
    setBusy(false);
    if (!r.ok)
      return toast(r.error.message, { title: "Not sent", tone: "error" });
    const skipped = r.data.recipients - r.data.queued;
    toast(
      `${r.data.queued} queued (${r.data.segments} SMS parts).${skipped ? ` ${skipped} skipped: same message already sent to them today.` : ""}`,
      { title: "SMS on its way" },
    );
    router.refresh();
  }

  if (!audiences.length)
    return (
      <p className="rounded-2xl border border-line bg-white p-6 text-ink-soft">
        No audience available for your role.
      </p>
    );

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-2xl border border-line bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="text-[13px] font-medium text-ink-soft">
              Send to
            </span>
            <select
              value={audience}
              onChange={(e) => (
                setAudience(e.target.value),
                setConfirming(false)
              )}
              className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 text-[15px]"
            >
              {audiences.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label} ({a.count})
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-[13px] font-medium text-ink-soft">
              Template
            </span>
            <select
              value={templateId}
              onChange={(e) => {
                setTemplateId(e.target.value);
                setBody(
                  templates.find((t) => t.id === e.target.value)?.body ?? "",
                );
                setConfirming(false);
              }}
              className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 text-[15px]"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
              {templates.length !== 1 || templates[0].type !== "FEE_DUE" ? (
                <option value="">Blank message</option>
              ) : null}
            </select>
          </label>
        </div>
        <label className="mt-4 block">
          <span className="text-[13px] font-medium text-ink-soft">Message</span>
          <textarea
            value={body}
            onChange={(e) => (setBody(e.target.value), setConfirming(false))}
            rows={6}
            className="mt-1 block w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
          />
        </label>
        <p className="mt-2 text-[13px] text-ink-soft">
          Variables like{" "}
          <code className="rounded bg-paper px-1">{"{student_name}"}</code>,{" "}
          <code className="rounded bg-paper px-1">{"{class}"}</code> and{" "}
          <code className="rounded bg-paper px-1">{"{due_amount}"}</code> are
          filled per guardian.
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
            <dd
              className={`font-semibold tabular-nums ${known && balance - credits < 0 ? "text-coral" : ""}`}
            >
              {known ? balance - credits : "—"}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          disabled={!seg.len || !count || busy}
          onClick={send}
          className={`btn-primary mt-5 w-full disabled:opacity-50 ${confirming ? "bg-coral!" : ""}`}
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="size-4" aria-hidden="true" />
          )}{" "}
          {confirming
            ? `Tap again to send ${credits} SMS`
            : `Send to ${count} guardians`}
        </button>
        {confirming && (
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="mt-2 w-full text-[13.5px] font-semibold text-ink-soft"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
