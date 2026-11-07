"use client";

import { Camera, KeyRound, Loader2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { api, refreshSession } from "@/lib/api/client";

import Modal from "../Modal";
import { DEMO_SAVED, useToast } from "../Toast";
import PortalCredentials from "./PortalCredentials";
import StudentForm from "./StudentForm";

/** Profile actions: edit (incl. class/roll/status), photo (private), guardian portal password reset. */
export default function StudentProfileActions({ student, sections, demo = false }) {
    const router = useRouter();
    const toast = useToast();
    const fileInput = useRef(null);
    const [open, setOpen] = useState(null); // "edit" | "reset"
    const [creds, setCreds] = useState(null);
    const [busy, setBusy] = useState(false);
    const close = () => {
        setOpen(null);
        setCreds(null);
    };

    async function uploadPhoto(e) {
        const f = e.target.files?.[0];
        e.target.value = "";
        if (!f) return;
        if (demo) return toast(DEMO_SAVED, { title: "Photo", tone: "info" });
        setBusy(true);
        const fd = new FormData();
        fd.append("file", f);
        let res = await fetch(`/api/students/${student.id}/photo`, { method: "POST", body: fd, credentials: "same-origin" });
        if (res.status === 401 && (await refreshSession())) res = await fetch(`/api/students/${student.id}/photo`, { method: "POST", body: fd, credentials: "same-origin" });
        setBusy(false);
        const json = await res.json().catch(() => null);
        if (!res.ok) return toast(json?.error?.message ?? "Upload failed.", { title: "Photo not saved", tone: "error" });
        toast("Photo updated. Only staff and the guardian can see it.", { title: "Saved" });
        router.refresh();
    }

    async function reset() {
        if (demo) return (close(), toast("Demo: a new one-time portal password would be generated and printed for the guardian.", { title: "Password reset", tone: "info" }));
        setBusy(true);
        const r = await api(`/api/students/${student.id}/portal-reset`, { method: "POST" });
        setBusy(false);
        if (!r.ok) return toast(r.error.message, { title: "Not reset", tone: "error" });
        setCreds(r.data);
    }

    return (
        <>
            <button type="button" onClick={() => fileInput.current?.click()} disabled={busy} className="btn-ghost min-h-10 text-[14px]">
                {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Camera className="size-4" aria-hidden="true" />} Photo
            </button>
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} className="hidden" />
            <button type="button" onClick={() => setOpen("reset")} className="btn-ghost min-h-10 text-[14px]">
                <KeyRound className="size-4" aria-hidden="true" /> Reset portal password
            </button>
            <button type="button" onClick={() => setOpen("edit")} className="btn-primary min-h-10 text-[14px]">
                <Pencil className="size-4" aria-hidden="true" /> Edit profile
            </button>

            <Modal open={open === "edit"} onClose={close} title={`Edit ${student.name}`} size="lg">
                {open === "edit" && (
                    <StudentForm
                        student={student}
                        sections={sections}
                        onCancel={close}
                        onDone={() => {
                            close();
                            if (demo) return toast(DEMO_SAVED, { title: "Profile saved", tone: "info" });
                            toast("Profile saved.", { title: "Saved" });
                            router.refresh();
                        }}
                    />
                )}
            </Modal>

            <Modal
                open={open === "reset"}
                onClose={close}
                title="Reset portal password?"
                size="sm"
                footer={
                    creds ? (
                        <button type="button" className="btn-primary min-h-10 text-[14px]" onClick={close}>
                            Done
                        </button>
                    ) : (
                        <>
                            <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={close}>
                                Cancel
                            </button>
                            <button type="button" className="btn-primary min-h-10 text-[14px]" onClick={reset} disabled={busy}>
                                Reset password
                            </button>
                        </>
                    )
                }
            >
                {creds ? (
                    <PortalCredentials name={student.name} username={creds.username} password={creds.tempPassword} />
                ) : (
                    <p className="text-[15px] text-ink-soft">A new one-time password is made for {student.name}&apos;s guardian. They are signed out everywhere and choose their own password at the next sign-in.</p>
                )}
            </Modal>
        </>
    );
}
