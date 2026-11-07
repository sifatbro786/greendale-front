"use client";

import Link from "next/link";
import { useState } from "react";

import { useApiAction } from "../academics/useApiAction";
import Modal from "../Modal";

const CONFIRM = {
    LOCKED: { title: "Lock marks entry?", text: "Teachers can no longer change marks. Review the tabulation, then publish. You can reopen marks entry if something needs fixing.", button: "Lock marks" },
    unpublish: { title: "Unpublish results?", text: "Guardians stop seeing this result in the portal and the exam goes back to Locked. SMS already sent cannot be recalled. This is written to the audit log.", button: "Unpublish" },
    delete: { title: "Delete this draft exam?", text: "The exam and its subject setup are removed. Only drafts without marks can be deleted.", button: "Delete exam" },
};

/**
 * Status buttons on an exam card (POST /api/exams/:id/status, /unpublish, DELETE).
 * @param {{ exam: { id: string, name: string, status: string }, canManage: boolean, isSuperAdmin: boolean, canPublish: boolean, demo?: boolean }} props
 */
export default function ExamActions({ exam, canManage, isSuperAdmin, canPublish, demo = false }) {
    const { busy, run } = useApiAction({ demo });
    const [ask, setAsk] = useState(null);
    const btn = "btn-ghost min-h-9 px-3.5 text-[13.5px]";
    const status = (to, success) => run(`/api/exams/${exam.id}/status`, "POST", { status: to }, { success });

    async function confirmed() {
        const what = ask;
        setAsk(null);
        if (what === "LOCKED") await status("LOCKED", `Marks for ${exam.name} are locked.`);
        if (what === "unpublish") await run(`/api/exams/${exam.id}/unpublish`, "POST", {}, { success: `${exam.name} is unpublished.` });
        if (what === "delete") await run(`/api/exams/${exam.id}`, "DELETE", undefined, { success: `${exam.name} deleted.` });
    }

    return (
        <div className="mt-5 flex flex-wrap gap-2">
            {canManage && exam.status === "DRAFT" && (
                <>
                    <button type="button" disabled={busy} className="btn-primary min-h-9 px-3.5 text-[13.5px]" onClick={() => status("MARKS_OPEN", `Teachers can now enter marks for ${exam.name}.`)}>
                        Open marks entry
                    </button>
                    <button type="button" disabled={busy} className={`${btn} text-coral`} onClick={() => setAsk("delete")}>
                        Delete
                    </button>
                </>
            )}
            {canManage && exam.status === "MARKS_OPEN" && (
                <button type="button" disabled={busy} className={btn} onClick={() => setAsk("LOCKED")}>
                    Lock marks
                </button>
            )}
            {canManage && exam.status === "LOCKED" && (
                <button type="button" disabled={busy} className={btn} onClick={() => status("MARKS_OPEN", `Marks entry for ${exam.name} is open again.`)}>
                    Reopen marks
                </button>
            )}
            {exam.status === "PUBLISHED" && isSuperAdmin && (
                <button type="button" disabled={busy} className={btn} onClick={() => setAsk("unpublish")}>
                    Unpublish
                </button>
            )}
            {canManage && exam.status !== "PUBLISHED" && (
                <Link href={`/admin/exams/${exam.id}`} className={btn}>
                    Setup
                </Link>
            )}
            <Link href={`/admin/exams/results?exam=${exam.id}`} className={exam.status === "LOCKED" && canPublish ? "btn-primary min-h-9 px-3.5 text-[13.5px]" : btn}>
                {exam.status === "LOCKED" && canPublish ? "Review & publish" : "Tabulation"}
            </Link>

            <Modal
                open={Boolean(ask)}
                onClose={() => setAsk(null)}
                title={CONFIRM[ask]?.title ?? ""}
                size="sm"
                footer={
                    <>
                        <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={() => setAsk(null)}>
                            Cancel
                        </button>
                        <button type="button" className={ask === "LOCKED" ? "btn-primary min-h-10 text-[14px]" : "btn-primary min-h-10 bg-coral text-[14px] hover:bg-coral/90"} onClick={confirmed}>
                            {CONFIRM[ask]?.button}
                        </button>
                    </>
                }
            >
                <p className="text-[14.5px] text-ink">{CONFIRM[ask]?.text}</p>
            </Modal>
        </div>
    );
}
