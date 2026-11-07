"use client";

import { CheckCircle2, Download, FileUp, Loader2, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { api } from "@/lib/api/client";
import { downloadCsv, parseCsv, toCsv } from "@/lib/csv";

import Modal from "../Modal";
import { DEMO_SAVED, useToast } from "../Toast";

/** CSV column → API field. Headers are matched loosely ("Guardian Phone", "guardian_phone", "Mobile"). */
const COLUMNS = [
    ["name", "Name", ["name", "studentname", "fullname"], true],
    ["gender", "Gender", ["gender", "sex"], true],
    ["dob", "Date of birth", ["dob", "dateofbirth", "birthdate", "birthday"], true],
    ["class", "Class", ["class", "classname", "grade"], true],
    ["section", "Section", ["section"], false],
    ["roll", "Roll", ["roll", "rollno", "rollnumber"], false],
    ["fatherName", "Father's name", ["fathername", "father"], false],
    ["motherName", "Mother's name", ["mothername", "mother"], false],
    ["guardianName", "Guardian name", ["guardianname", "guardian"], false],
    ["guardianPhone", "Guardian mobile", ["guardianphone", "guardianmobile", "mobile", "phone", "contact"], true],
    ["guardianPhone2", "Second mobile", ["guardianphone2", "mobile2", "phone2", "alternatemobile"], false],
    ["guardianEmail", "Guardian email", ["guardianemail", "email"], false],
    ["bloodGroup", "Blood group", ["bloodgroup", "blood"], false],
    ["address", "Address", ["address", "presentaddress"], false],
    ["admissionDate", "Admission date", ["admissiondate", "admitted", "dateofadmission"], false],
];
const key = (h) => h.toLowerCase().replace(/[^a-z0-9]/g, "");
const CHECK_BATCH = 200;
const SAVE_BATCH = 50;

/**
 * Bulk admission from CSV (Excel: Save As → CSV UTF-8). The file is read in the browser, checked by the
 * API (POST /api/students/import { dryRun: true }), then saved in batches of 50 (each batch all or
 * nothing). One-time portal passwords come back once and are offered as a CSV to print for guardians.
 */
export default function ImportStudents({ demo = false }) {
    const router = useRouter();
    const toast = useToast();
    const input = useRef(null);
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [rows, setRows] = useState([]);
    const [missing, setMissing] = useState([]);
    const [errors, setErrors] = useState(null);
    const [phase, setPhase] = useState("pick"); // pick | checked | saving | done
    const [progress, setProgress] = useState(0);
    const [created, setCreated] = useState([]);

    const reset = () => {
        setFile(null);
        setRows([]);
        setMissing([]);
        setErrors(null);
        setPhase("pick");
        setProgress(0);
        setCreated([]);
        if (input.current) input.current.value = "";
    };

    function template() {
        downloadCsv("student-import-template.csv", toCsv(COLUMNS.map((c) => c[1]), [["Rafi Hasan", "Male", "09/03/2019", "Class I", "A", "", "Karim Hasan", "Nasrin Akter", "", "01712345678", "", "", "B+", "Mirpur 1, Dhaka", ""]]));
    }

    async function onFile(e) {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > 2_000_000) return toast("Use a CSV under 2 MB (about 5,000 students).", { title: "File too large", tone: "error" });
        const table = parseCsv(await f.text());
        if (table.length < 2) return toast("The file has no student rows under the header.", { title: "Empty file", tone: "error" });
        const header = table[0].map(key);
        const index = Object.fromEntries(COLUMNS.map(([field, , names]) => [field, header.findIndex((h) => names.includes(h))]));
        setMissing(COLUMNS.filter(([field, , , req]) => req && index[field] === -1).map((c) => c[1]));
        setRows(table.slice(1).map((r) => Object.fromEntries(COLUMNS.filter(([field]) => index[field] !== -1).map(([field]) => [field, (r[index[field]] ?? "").trim()]))));
        setFile(f.name);
        setErrors(null);
        setPhase("pick");
    }

    async function check() {
        if (demo) return toast(DEMO_SAVED, { title: `${rows.length} rows would be checked`, tone: "info" });
        setPhase("checking");
        const all = [];
        for (let i = 0; i < rows.length; i += CHECK_BATCH) {
            const r = await api("/api/students/import", { method: "POST", body: { rows: rows.slice(i, i + CHECK_BATCH), firstRow: i + 2, dryRun: true } });
            if (!r.ok) {
                setPhase("pick");
                return toast(r.error.message, { title: "Could not check the file", tone: "error" });
            }
            all.push(...r.data.errors);
        }
        setErrors(all);
        setPhase("checked");
    }

    async function save() {
        setPhase("saving");
        const out = [];
        for (let i = 0; i < rows.length; i += SAVE_BATCH) {
            const r = await api("/api/students/import", { method: "POST", body: { rows: rows.slice(i, i + SAVE_BATCH), firstRow: i + 2, dryRun: false } });
            if (!r.ok || r.data.errors.length) {
                setCreated(out);
                setErrors(r.ok ? r.data.errors : [{ row: i + 2, field: "", message: r.error.message }]);
                setPhase(out.length ? "done" : "checked");
                return toast(`${out.length} students were saved before rows ${i + 2}+ failed. Fix those rows and import only the rest.`, { title: "Import stopped", tone: "error" });
            }
            out.push(...r.data.created);
            setProgress(out.length);
        }
        setCreated(out);
        setPhase("done");
        router.refresh();
    }

    function credentials() {
        downloadCsv(
            `portal-logins-${new Date().toISOString().slice(0, 10)}.csv`,
            toCsv(["Student", "Student ID", "Class", "Roll", "Portal username", "One-time password"], created.map((c) => [c.name, c.studentUid, c.section, c.roll, c.username, c.tempPassword])),
        );
    }

    const blocking = missing.length > 0;
    const okRows = errors ? rows.length - new Set(errors.map((e) => e.row)).size : 0;

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className="btn-ghost min-h-10 text-[14px]">
                <FileUp className="size-4" aria-hidden="true" /> Import CSV
            </button>
            <Modal
                open={open}
                onClose={() => {
                    if (phase === "saving") return;
                    setOpen(false);
                    if (phase === "done") reset();
                }}
                title="Import students"
                size="lg"
                footer={
                    phase === "done" ? (
                        <>
                            <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={() => (setOpen(false), reset())}>
                                Close
                            </button>
                            <button type="button" className="btn-primary min-h-10 text-[14px]" onClick={credentials}>
                                <Download className="size-4" aria-hidden="true" /> Download portal logins
                            </button>
                        </>
                    ) : (
                        <>
                            <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={template}>
                                <Download className="size-4" aria-hidden="true" /> Template
                            </button>
                            {phase === "checked" && errors?.length === 0 ? (
                                <button type="button" className="btn-primary min-h-10 text-[14px]" onClick={save}>
                                    Import {rows.length} students
                                </button>
                            ) : (
                                <button type="button" className="btn-primary min-h-10 text-[14px]" disabled={!rows.length || blocking || phase === "checking" || phase === "saving"} onClick={check}>
                                    {phase === "checking" || phase === "saving" ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                                    {phase === "saving" ? `Saving ${progress}/${rows.length}…` : errors ? "Check again" : "Check file"}
                                </button>
                            )}
                        </>
                    )
                }
            >
                {phase === "done" ? (
                    <div>
                        <p className="flex items-center gap-2 text-[15px] font-semibold text-brand-deep">
                            <CheckCircle2 className="size-5" aria-hidden="true" /> {created.length} students admitted
                        </p>
                        <p className="mt-2 text-[14px] text-ink">Download the portal logins now and keep them safe. The one-time passwords are shown only once; guardians must change them at first sign-in. A lost password can be reset from the student profile.</p>
                        {errors?.length > 0 && <ErrorList errors={errors} />}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <ol className="list-decimal space-y-1 pl-5 text-[14px] text-ink-soft">
                            <li>Download the template, fill one student per row (Excel: Save As → CSV UTF-8).</li>
                            <li>Required: Name, Gender, Date of birth (DD/MM/YYYY), Class, Guardian mobile. Section defaults to A, an empty roll gets the next free roll.</li>
                            <li>Check the file. Nothing is saved until every row is correct.</li>
                        </ol>
                        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-line bg-paper/50 px-4 py-5 hover:border-brand">
                            <FileUp className="size-6 text-brand" aria-hidden="true" />
                            <span className="text-[14.5px]">{file ? <b>{file}</b> : "Choose the CSV file"}{file && <span className="text-ink-soft"> · {rows.length} rows</span>}</span>
                            <input ref={input} type="file" accept=".csv,text/csv" className="sr-only" onChange={onFile} />
                        </label>
                        {blocking && <p className="rounded-xl bg-coral-soft px-3.5 py-2.5 text-[14px] text-[#b4432a]">Missing columns: {missing.join(", ")}. Use the template headers.</p>}
                        {errors && errors.length === 0 && (
                            <p className="flex items-center gap-2 rounded-xl bg-brand-soft px-3.5 py-2.5 text-[14px] font-medium text-brand-deep">
                                <CheckCircle2 className="size-4" aria-hidden="true" /> All {rows.length} rows are correct. Ready to import.
                            </p>
                        )}
                        {errors?.length > 0 && (
                            <>
                                <p className="flex items-center gap-2 text-[14px] font-medium text-[#8a6a00]">
                                    <TriangleAlert className="size-4" aria-hidden="true" /> {errors.length} problem{errors.length > 1 ? "s" : ""} in {new Set(errors.map((e) => e.row)).size} rows ({okRows} rows are fine). Fix the file and choose it again.
                                </p>
                                <ErrorList errors={errors} />
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
}

function ErrorList({ errors }) {
    return (
        <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-line">
            <table className="w-full text-left text-[13.5px]">
                <thead className="sticky top-0 bg-paper text-[12px] tracking-wide text-ink-soft uppercase">
                    <tr>
                        <th className="px-3 py-2 font-semibold">Row</th>
                        <th className="px-3 py-2 font-semibold">Column</th>
                        <th className="px-3 py-2 font-semibold">Problem</th>
                    </tr>
                </thead>
                <tbody>
                    {errors.slice(0, 300).map((e, i) => (
                        <tr key={i} className="border-t border-line">
                            <td className="px-3 py-1.5 tabular-nums">{e.row}</td>
                            <td className="px-3 py-1.5">{COLUMNS.find((c) => c[0] === e.field)?.[1] ?? e.field}</td>
                            <td className="px-3 py-1.5">{e.message}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
