"use client";

import { FileSpreadsheet, Printer, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Modal from "../Modal";
import { DEMO_SAVED, useToast } from "../Toast";
import PortalCredentials from "./PortalCredentials";
import PromoteDialog from "./PromoteDialog";
import StudentForm from "./StudentForm";

/** Students page actions: print, admit (creates the portal login), promote. Excel import ships in Step 5. */
export default function StudentAdmit({ sections, sessions, demo = false }) {
    const router = useRouter();
    const toast = useToast();
    const [open, setOpen] = useState(null); // "add" | "promote" | null
    const [done, setDone] = useState(null);
    const close = () => {
        setOpen(null);
        setDone(null);
    };
    return (
        <>
            <button type="button" onClick={() => window.print()} className="btn-ghost min-h-10 text-[14px]">
                <Printer className="size-4" aria-hidden="true" /> Print
            </button>
            {demo ? (
                <button type="button" onClick={() => toast(DEMO_SAVED, { title: "Import Excel", tone: "info" })} className="btn-ghost min-h-10 text-[14px]">
                    <FileSpreadsheet className="size-4" aria-hidden="true" /> Import Excel
                </button>
            ) : (
                <button type="button" onClick={() => setOpen("promote")} className="btn-ghost min-h-10 text-[14px]">
                    Promote students
                </button>
            )}
            <button type="button" onClick={() => setOpen("add")} className="btn-primary min-h-10 text-[14px]">
                <UserPlus className="size-4" aria-hidden="true" /> Add student
            </button>

            <Modal open={open === "add"} onClose={close} title={done ? "Student admitted" : "Add student"} size="lg">
                {done ? (
                    <div className="space-y-4">
                        <p className="text-[15px] text-ink">
                            <b>{done.student.name}</b> is in {done.student.section}, roll {done.student.roll}.
                        </p>
                        <PortalCredentials name={done.student.name} username={done.portal.username} password={done.portal.tempPassword} />
                        <div className="flex flex-wrap gap-2">
                            <Link href={`/admin/students/${done.student.id}`} className="btn-primary min-h-10 text-[14px]">
                                Open profile
                            </Link>
                            <button type="button" onClick={() => setDone(null)} className="btn-ghost min-h-10 text-[14px]">
                                Admit another
                            </button>
                        </div>
                    </div>
                ) : (
                    <StudentForm
                        sections={sections}
                        onCancel={close}
                        onDone={(d) => {
                            if (demo) return (close(), toast(DEMO_SAVED, { title: "Student would be created with a portal login", tone: "info" }));
                            setDone(d);
                            router.refresh();
                        }}
                    />
                )}
            </Modal>
            {open === "promote" && <PromoteDialog sections={sections} sessions={sessions} onClose={close} />}
        </>
    );
}
