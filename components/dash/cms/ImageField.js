"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { uploadFile } from "@/lib/api/client";

import { DEMO_SAVED, useToast } from "../Toast";

const MAX_MB = 10;

/**
 * One photo: upload → preview → alt text. Value: { path, url, alt, width, height } | null
 * The photo is converted to WebP by the API; `path` is what the save request sends back.
 * @param {{ value: any, onChange: (v: any) => void, folder: string, label?: string, required?: boolean, demo?: boolean, error?: string }} props
 */
export default function ImageField({ value, onChange, folder, label = "Photo", required = false, demo = false, error }) {
    const input = useRef(null);
    const toast = useToast();
    const [busy, setBusy] = useState(false);

    async function pick(e) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        if (demo) return toast(DEMO_SAVED, { title: "Upload", tone: "info" });
        if (file.size > MAX_MB * 1024 * 1024) return toast(`Photos can be up to ${MAX_MB} MB.`, { title: "Too large", tone: "error" });
        setBusy(true);
        const r = await uploadFile(file, { kind: "image", folder });
        setBusy(false);
        if (!r.ok) return toast(r.error.message, { title: "Upload failed", tone: "error" });
        onChange({ path: r.data.path, url: r.data.url, alt: value?.alt ?? "", width: r.data.width, height: r.data.height });
    }

    return (
        <div>
            <span className="text-[14px] font-medium text-ink">
                {label}
                {required && " *"}
            </span>
            {value?.url ? (
                <div className="mt-1 overflow-hidden rounded-xl border border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element -- preview of a just-uploaded file */}
                    <img src={value.url} alt="" className="aspect-[16/9] w-full bg-paper object-cover" />
                    <div className="flex flex-wrap items-center gap-2 p-3">
                        <input
                            value={value.alt ?? ""}
                            onChange={(e) => onChange({ ...value, alt: e.target.value })}
                            placeholder="Describe the photo (for screen readers and Google)"
                            aria-label="Photo description"
                            className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-[14.5px] outline-none focus:border-brand"
                        />
                        <button type="button" onClick={() => input.current?.click()} disabled={busy} className="btn-ghost min-h-10 text-[13.5px]">
                            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="size-4" aria-hidden="true" />} Replace
                        </button>
                        {!required && (
                            <button type="button" onClick={() => onChange(null)} className="grid size-10 place-items-center rounded-full text-ink-soft hover:bg-coral-soft hover:text-coral" aria-label="Remove photo">
                                <Trash2 className="size-4" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => input.current?.click()}
                    disabled={busy}
                    className={`mt-1 flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-paper/50 text-ink-soft hover:border-brand hover:text-brand-deep ${error ? "border-coral" : "border-line"}`}
                >
                    {busy ? <Loader2 className="size-7 animate-spin" aria-hidden="true" /> : <ImagePlus className="size-7" aria-hidden="true" />}
                    <span className="text-[14.5px] font-medium">{busy ? "Uploading…" : "Choose a photo"}</span>
                    <span className="text-[12.5px]">JPG, PNG or WebP, up to {MAX_MB} MB</span>
                </button>
            )}
            {error && <span className="mt-1 block text-[13px] text-coral">{error}</span>}
            <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} className="hidden" />
        </div>
    );
}
