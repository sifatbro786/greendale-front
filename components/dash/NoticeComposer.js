"use client";

import { FileText, Loader2, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { api, uploadFile } from "@/lib/api/client";

import { errorText, field, fieldBorder, hint, label } from "./admin/fields";
import ConfirmDelete from "./cms/ConfirmDelete";
import RichTextEditor from "./cms/RichTextEditor";
import { fromDhakaInput, nowDhakaInput, toDhakaInput } from "./cms/time";
import Modal from "./Modal";
import { DEMO_SAVED, useToast } from "./Toast";

/**
 * Notice editor: create (button) or edit/delete (row actions). POST/PATCH/DELETE /api/notices.
 * Audience: website (PUBLIC), everyone, staff only, or guardians of one class. A future time schedules
 * it; Draft keeps it hidden. "Send as SMS" texts the title to guardians (everyone / one class).
 * @param {{ audiences: {value:string,label:string}[], notice?: any, demo?: boolean }} props
 */
export default function NoticeComposer({ audiences, notice, demo = false }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function remove() {
    setRemoving(false);
    if (demo)
      return toast(DEMO_SAVED, { title: "Notice deleted", tone: "info" });
    const r = await api(`/api/notices/${notice.id}`, { method: "DELETE" });
    if (!r.ok)
      return toast(r.error.message, { title: "Not deleted", tone: "error" });
    toast(`“${notice.title}” was deleted.`, { title: "Notice deleted" });
    router.refresh();
  }

  return (
    <>
      {notice ? (
        <span className="flex gap-1">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid size-9 place-items-center rounded-lg text-ink-soft hover:bg-paper"
            aria-label={`Edit ${notice.title}`}
          >
            <Pencil className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setRemoving(true)}
            className="grid size-9 place-items-center rounded-lg text-ink-soft hover:bg-coral-soft hover:text-coral"
            aria-label={`Delete ${notice.title}`}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-primary min-h-10 text-[14px]"
        >
          <Plus className="size-4" aria-hidden="true" /> New notice
        </button>
      )}
      {open && (
        <NoticeForm
          audiences={audiences}
          notice={notice}
          demo={demo}
          onClose={() => setOpen(false)}
        />
      )}
      {notice && (
        <ConfirmDelete
          item={removing ? notice : null}
          onCancel={() => setRemoving(false)}
          onConfirm={remove}
        />
      )}
    </>
  );
}

function NoticeForm({ audiences, notice, demo, onClose }) {
  const router = useRouter();
  const toast = useToast();
  const pdfInput = useRef(null);
  const future =
    notice?.publishedAt && new Date(notice.publishedAt) > new Date();
  const [v, setV] = useState({
    title: notice?.title ?? "",
    bodyHtml: notice?.bodyHtml ?? "",
    audience: notice?.audience ?? audiences[0]?.value ?? "ALL",
    category: notice?.category ?? "GENERAL",
    pinned: notice?.pinned ?? false,
    status: !notice
      ? "now"
      : !notice.publishedAt
        ? "draft"
        : future
          ? "later"
          : "now",
    when: notice?.publishedAt
      ? toDhakaInput(notice.publishedAt)
      : nowDhakaInput(),
    pdf: notice?.pdfPath
      ? { path: notice.pdfPath, name: "Attached PDF" }
      : null,
    sendSms: false,
  });
  const [state, setState] = useState({
    busy: false,
    error: "",
    fieldErrors: {},
  });
  const [uploading, setUploading] = useState(false);
  const fe = state.fieldErrors;
  const set = (k) => (e) =>
    setV((s) => ({
      ...s,
      [k]: e?.target
        ? e.target.type === "checkbox"
          ? e.target.checked
          : e.target.value
        : e,
    }));
  const [aud, classId] = v.audience.split(":");
  const smsAllowed = (aud === "ALL" || aud === "CLASS") && v.status === "now";

  async function pickPdf(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (demo) return toast(DEMO_SAVED, { title: "PDF", tone: "info" });
    setUploading(true);
    const r = await uploadFile(f, { kind: "pdf", folder: "notices" });
    setUploading(false);
    if (!r.ok)
      return toast(r.error.message, { title: "Upload failed", tone: "error" });
    setV((s) => ({ ...s, pdf: { path: r.data.path, name: f.name } }));
  }

  async function submit() {
    if (demo)
      return (
        onClose(),
        toast(DEMO_SAVED, { title: "Notice published", tone: "info" })
      );
    setState({ busy: true, error: "", fieldErrors: {} });
    const publishedAt =
      v.status === "draft"
        ? null
        : v.status === "later"
          ? fromDhakaInput(v.when)
          : notice?.publishedAt && !future
            ? notice.publishedAt
            : new Date().toISOString();
    const body = {
      title: v.title,
      bodyHtml: v.bodyHtml,
      audience: aud,
      classId: aud === "CLASS" ? classId : null,
      category: v.category,
      pinned: v.pinned,
      publishedAt,
      pdfPath: v.pdf?.path ?? null,
      sendSms: smsAllowed && v.sendSms,
    };
    const r = await api(notice ? `/api/notices/${notice.id}` : "/api/notices", {
      method: notice ? "PATCH" : "POST",
      body,
    });
    if (!r.ok) {
      const hasFields = Object.keys(r.fieldErrors).length > 0;
      return setState({
        busy: false,
        error: hasFields
          ? "Please check the highlighted fields."
          : r.error.message,
        fieldErrors: r.fieldErrors,
      });
    }
    onClose();
    toast(
      r.data.smsQueued
        ? `SMS is going to ${r.data.smsQueued} guardians.`
        : v.status === "draft"
          ? "Saved as a draft."
          : v.status === "later"
            ? "It appears at the chosen time."
            : "It is visible now.",
      { title: notice ? "Notice saved" : "Notice published" },
    );
    router.refresh();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={notice ? "Edit notice" : "New notice"}
      size="lg"
      footer={
        <>
          <button
            type="button"
            className="btn-ghost min-h-10 text-[14px]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary min-h-10 text-[14px]"
            onClick={submit}
            disabled={state.busy || uploading}
          >
            {state.busy && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            {v.status === "draft" ? "Save draft" : notice ? "Save" : "Publish"}
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className={label}>Title *</span>
          <input
            value={v.title}
            onChange={set("title")}
            className={`${field} ${fieldBorder(fe.title)}`}
            placeholder="e.g. Annual exam routine published"
          />
          {fe.title && <span className={errorText}>{fe.title}</span>}
        </label>
        <label>
          <span className={label}>Who sees it</span>
          <select
            value={v.audience}
            onChange={set("audience")}
            className={`${field} ${fieldBorder(fe.classId)}`}
          >
            {audiences.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
          {fe.classId && <span className={errorText}>{fe.classId}</span>}
        </label>
        <label>
          <span className={label}>Category</span>
          <select
            value={v.category}
            onChange={set("category")}
            className={`${field} border-line`}
          >
            {["GENERAL", "ADMISSION", "EXAM", "HOLIDAY", "EVENT"].map((c) => (
              <option key={c} value={c}>
                {c.charAt(0) + c.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </label>
        <div className="sm:col-span-2">
          <span className={label}>Message</span>
          <div className="mt-1">
            <RichTextEditor
              value={v.bodyHtml}
              onChange={set("bodyHtml")}
              label="Message"
              minHeight={160}
            />
          </div>
        </div>
        <fieldset className="sm:col-span-2">
          <legend className={label}>When</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {[
              ["now", "Publish now"],
              ["later", "Schedule"],
              ["draft", "Draft"],
            ].map(([val, text]) => (
              <label
                key={val}
                className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[14px] ${v.status === val ? "border-brand bg-brand-soft font-semibold text-brand-deep" : "border-line"}`}
              >
                <input
                  type="radio"
                  name="status"
                  value={val}
                  checked={v.status === val}
                  onChange={set("status")}
                  className="sr-only"
                />
                {text}
              </label>
            ))}
            {v.status === "later" && (
              <input
                type="datetime-local"
                value={v.when}
                onChange={set("when")}
                className="rounded-xl border border-line px-3 py-1.5 text-[14px]"
                aria-label="Publish at (Dhaka time)"
              />
            )}
          </div>
        </fieldset>
        <div className="sm:col-span-2">
          <span className={label}>PDF attachment</span>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => pdfInput.current?.click()}
              disabled={uploading}
              className="btn-ghost min-h-10 text-[14px]"
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Upload className="size-4" aria-hidden="true" />
              )}{" "}
              {v.pdf ? "Replace PDF" : "Attach PDF"}
            </button>
            {v.pdf && (
              <span className="flex items-center gap-2 text-[14px] text-ink">
                <FileText className="size-4 text-coral" aria-hidden="true" />{" "}
                {v.pdf.name}
                <button
                  type="button"
                  onClick={() => setV((s) => ({ ...s, pdf: null }))}
                  className="text-[13px] font-semibold text-ink-soft hover:text-coral"
                >
                  Remove
                </button>
              </span>
            )}
          </div>
          {fe.pdfPath && <span className={errorText}>{fe.pdfPath}</span>}
          <input
            ref={pdfInput}
            type="file"
            accept="application/pdf"
            onChange={pickPdf}
            className="hidden"
          />
        </div>
        <label className="flex items-center gap-2 text-[14px]">
          <input
            type="checkbox"
            checked={v.pinned}
            onChange={set("pinned")}
            className="size-4 accent-[var(--brand)]"
          />{" "}
          Pin to top
        </label>
        <label
          className={`flex items-start gap-2 text-[14px] ${smsAllowed ? "" : "opacity-50"}`}
        >
          <input
            type="checkbox"
            checked={smsAllowed && v.sendSms}
            onChange={set("sendSms")}
            disabled={!smsAllowed}
            className="mt-0.5 size-4 accent-[var(--brand)]"
          />
          <span>
            Also send the title as SMS
            <span className={hint}>
              Guardians only, when published now. Costs SMS credit.
            </span>
          </span>
        </label>
        {state.error && (
          <p
            role="alert"
            className="rounded-xl bg-coral-soft px-4 py-3 text-[14.5px] text-ink sm:col-span-2"
          >
            {state.error}
          </p>
        )}
      </div>
    </Modal>
  );
}
