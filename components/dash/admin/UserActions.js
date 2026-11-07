"use client";

import { KeyRound, LockOpen, Power } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/lib/api/client";

import Modal from "../Modal";
import { DEMO_SAVED, useToast } from "../Toast";
import TempPassword from "./TempPassword";

/**
 * Account actions: reset password, unlock, enable/disable.
 * @param {{ user: { id: string, name: string, status: string, locked: boolean }, isSelf: boolean, demo?: boolean }} props
 */
export default function UserActions({ user, isSelf, demo = false }) {
    const router = useRouter();
    const toast = useToast();
    const [confirm, setConfirm] = useState(null); // "reset" | "disable" | null
    const [busy, setBusy] = useState(false);
    const [temp, setTemp] = useState(null);

    async function run(path, method, body, done) {
        if (demo) {
            setConfirm(null);
            return toast(DEMO_SAVED, { title: "Looks good!", tone: "info" });
        }
        setBusy(true);
        const r = await api(path, { method, body });
        setBusy(false);
        if (!r.ok) return toast(r.error.message, { title: "Not saved", tone: "error" });
        done(r.data);
        router.refresh();
    }

    const reset = () =>
        run(`/api/users/${user.id}/reset-password`, "POST", undefined, (d) => {
            setTemp(d.tempPassword);
        });
    const toggle = () =>
        run(`/api/users/${user.id}`, "PATCH", { status: user.status === "ACTIVE" ? "DISABLED" : "ACTIVE" }, () => {
            setConfirm(null);
            toast(user.status === "ACTIVE" ? `${user.name} can no longer sign in.` : `${user.name} can sign in again.`, { title: user.status === "ACTIVE" ? "Account disabled" : "Account enabled" });
        });
    const unlock = () => run(`/api/users/${user.id}/unlock`, "POST", undefined, () => toast(`${user.name} can try signing in again.`, { title: "Unlocked" }));

    if (isSelf) return <p className="text-[14px] text-ink-soft">This is your own account. Use “Change password” in the menu at the top right.</p>;

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setConfirm("reset")} className="btn-ghost min-h-10 text-[14px]">
                    <KeyRound className="size-4" aria-hidden="true" /> Reset password
                </button>
                {user.locked && (
                    <button type="button" onClick={unlock} disabled={busy} className="btn-ghost min-h-10 text-[14px]">
                        <LockOpen className="size-4" aria-hidden="true" /> Unlock
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => (user.status === "ACTIVE" ? setConfirm("disable") : toggle())}
                    disabled={busy}
                    className={`btn-ghost min-h-10 text-[14px] ${user.status === "ACTIVE" ? "hover:text-coral" : ""}`}
                >
                    <Power className="size-4" aria-hidden="true" /> {user.status === "ACTIVE" ? "Disable account" : "Enable account"}
                </button>
            </div>

            <Modal
                open={confirm === "reset"}
                onClose={() => {
                    setConfirm(null);
                    setTemp(null);
                }}
                title={`Reset password for ${user.name}?`}
                size="sm"
                footer={
                    temp ? (
                        <button type="button" className="btn-primary min-h-10 text-[14px]" onClick={() => (setConfirm(null), setTemp(null))}>
                            Done
                        </button>
                    ) : (
                        <>
                            <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={() => setConfirm(null)}>
                                Cancel
                            </button>
                            <button type="button" className="btn-primary min-h-10 text-[14px]" onClick={reset} disabled={busy}>
                                Reset password
                            </button>
                        </>
                    )
                }
            >
                {temp ? (
                    <TempPassword who={user.name} password={temp} />
                ) : (
                    <p className="text-[15px] text-ink-soft">A new one-time password is created and {user.name} is signed out on every device. They choose their own password at the next sign-in.</p>
                )}
            </Modal>

            <Modal
                open={confirm === "disable"}
                onClose={() => setConfirm(null)}
                title={`Disable ${user.name}?`}
                size="sm"
                footer={
                    <>
                        <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={() => setConfirm(null)}>
                            Cancel
                        </button>
                        <button type="button" className="btn-primary min-h-10 bg-coral! text-[14px]" onClick={toggle} disabled={busy}>
                            Disable
                        </button>
                    </>
                }
            >
                <p className="text-[15px] text-ink-soft">They are signed out right away and cannot sign in until the account is enabled again. Their past work (marks, payments, audit entries) stays.</p>
            </Modal>
        </div>
    );
}
