"use client";

import { FileSpreadsheet, Printer, UserPlus } from "lucide-react";
import { useState } from "react";

import Modal from "./Modal";
import { DEMO_SAVED, useToast } from "./Toast";

const field = "mt-1 block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10";

/**
 * Add student + Excel import (PRD §6.2). Phase 2: POST /api/students, POST /api/students/import (preview, then commit).
 * Creating a student also creates the portal user (username = studentUid, one-time password).
 */
export default function StudentActions({ sections }) {
    const [modal, setModal] = useState(null);
    const toast = useToast();
    const close = () => setModal(null);
    const save = (e) => {
        e?.preventDefault();
        close();
        toast(DEMO_SAVED, { title: "Student would be created with a portal login", tone: "info" });
    };

    return (
        <>
            <button type="button" onClick={() => window.print()} className="btn-ghost min-h-10 text-[14px]">
                <Printer className="size-4" aria-hidden="true" /> Print
            </button>
            <button type="button" onClick={() => setModal("import")} className="btn-ghost min-h-10 text-[14px]">
                <FileSpreadsheet className="size-4" aria-hidden="true" /> Import Excel
            </button>
            <button type="button" onClick={() => setModal("add")} className="btn-primary min-h-10 text-[14px]">
                <UserPlus className="size-4" aria-hidden="true" /> Add student
            </button>

            <Modal
                open={modal === "add"}
                onClose={close}
                title="Add student"
                size="lg"
                footer={
                    <>
                        <button type="button" onClick={close} className="btn-ghost min-h-10 text-[14px]">
                            Cancel
                        </button>
                        <button type="submit" form="add-student" className="btn-primary min-h-10 text-[14px]">
                            Save student
                        </button>
                    </>
                }
            >
                <form id="add-student" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
                    <label className="sm:col-span-2">
                        <span className="text-[14px] font-medium">Full name *</span>
                        <input required className={field} placeholder="Student's full name" />
                    </label>
                    <label>
                        <span className="text-[14px] font-medium">Date of birth *</span>
                        <input required type="date" className={field} />
                    </label>
                    <label>
                        <span className="text-[14px] font-medium">Gender *</span>
                        <select required className={field} defaultValue="">
                            <option value="" disabled>
                                Select
                            </option>
                            <option>Female</option>
                            <option>Male</option>
                        </select>
                    </label>
                    <label>
                        <span className="text-[14px] font-medium">Class & section *</span>
                        <select required className={field} defaultValue="">
                            <option value="" disabled>
                                Select
                            </option>
                            {sections.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <span className="text-[14px] font-medium">Roll</span>
                        <input type="number" min="1" className={field} placeholder="Next free roll" />
                    </label>
                    <label>
                        <span className="text-[14px] font-medium">Father&apos;s name *</span>
                        <input required className={field} />
                    </label>
                    <label>
                        <span className="text-[14px] font-medium">Mother&apos;s name *</span>
                        <input required className={field} />
                    </label>
                    <label>
                        <span className="text-[14px] font-medium">Guardian mobile *</span>
                        <input required type="tel" inputMode="tel" placeholder="01XXXXXXXXX" className={field} />
                    </label>
                    <label>
                        <span className="text-[14px] font-medium">Photo</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp" className={`${field} py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-soft file:px-3 file:py-1.5 file:text-brand-deep`} />
                    </label>
                    <label className="sm:col-span-2">
                        <span className="text-[14px] font-medium">Address</span>
                        <textarea rows={2} className={field} />
                    </label>
                </form>
                <p className="mt-4 rounded-xl bg-sky-soft px-4 py-3 text-[13.5px] text-ink">A portal login is created automatically: username = Student ID, with a one-time password printed for the guardian.</p>
            </Modal>

            <Modal
                open={modal === "import"}
                onClose={close}
                title="Import students from Excel"
                footer={
                    <>
                        <button type="button" onClick={close} className="btn-ghost min-h-10 text-[14px]">
                            Cancel
                        </button>
                        <button type="button" onClick={save} className="btn-primary min-h-10 text-[14px]">
                            Validate file
                        </button>
                    </>
                }
            >
                <ol className="space-y-3 text-[14.5px]">
                    <li>
                        <span className="font-semibold">1. Download the template</span> with columns: Name, DOB, Gender, Class, Section, Roll, Father, Mother, Guardian mobile, Address.
                    </li>
                    <li>
                        <span className="font-semibold">2. Upload the filled .xlsx.</span> Every row is checked first; nothing is saved until the whole file is valid.
                    </li>
                    <li>
                        <span className="font-semibold">3. Review the preview</span> with row-level errors, then confirm.
                    </li>
                </ol>
                <label className="mt-5 flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line bg-paper px-6 py-10 text-center hover:border-brand">
                    <FileSpreadsheet className="size-8 text-brand" aria-hidden="true" />
                    <span className="font-medium">Choose an Excel file</span>
                    <span className="text-[13px] text-ink-soft">.xlsx up to 5 MB</span>
                    <input type="file" accept=".xlsx" className="sr-only" />
                </label>
            </Modal>
        </>
    );
}
