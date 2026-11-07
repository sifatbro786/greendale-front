"use client";

import { Loader2, Save, UserPlus } from "lucide-react";
import { useState } from "react";

import { api } from "@/lib/api/client";

import { errorText, field, fieldBorder, hint, label } from "../admin/fields";

const BLOOD = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

/**
 * Admission (POST /api/students) or profile edit (PATCH /api/students/:id).
 * @param {{ student?: any, sections: { value: string, label: string }[], onDone: (data: any) => void, onCancel?: () => void }} props
 */
export default function StudentForm({ student, sections, onDone, onCancel }) {
    const isNew = !student;
    const [v, setV] = useState({
        name: student?.name ?? "",
        dob: student?.dob ?? "",
        gender: student?.gender ?? "",
        bloodGroup: student?.bloodGroup ?? "",
        fatherName: student?.fatherName ?? "",
        motherName: student?.motherName ?? "",
        guardianName: student?.guardianName ?? "",
        guardianPhone: student?.guardianPhone ?? "",
        guardianPhone2: student?.guardianPhone2 ?? "",
        guardianEmail: student?.guardianEmail ?? "",
        address: student?.address ?? "",
        admissionDate: student?.admissionDate ?? "",
        sectionId: student?.sectionId ?? sections[0]?.value ?? "",
        roll: student?.roll ?? "",
        status: student?.status ?? "ACTIVE",
    });
    const [state, setState] = useState({ busy: false, error: "", fieldErrors: {} });
    const fe = state.fieldErrors;
    const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

    async function submit(e) {
        e.preventDefault();
        setState({ busy: true, error: "", fieldErrors: {} });
        const { roll, status, ...rest } = v;
        const body = {
            ...rest,
            ...(roll !== "" && { roll: Number(roll) }),
            ...(isNew ? {} : { status, ...(roll === "" && { roll: undefined }) }),
        };
        if (!isNew && body.sectionId === student.sectionId && Number(roll) === student.roll) {
            delete body.sectionId;
            delete body.roll;
        }
        const r = await api(isNew ? "/api/students" : `/api/students/${student.id}`, { method: isNew ? "POST" : "PATCH", body });
        if (!r.ok) {
            const hasFields = Object.keys(r.fieldErrors).length > 0;
            return setState({ busy: false, error: hasFields ? "Please check the highlighted fields." : r.error.message, fieldErrors: r.fieldErrors });
        }
        setState({ busy: false, error: "", fieldErrors: {} });
        onDone(r.data);
    }

    const input = (k, l, o = {}) => (
        <label className={o.wide ? "sm:col-span-2" : ""}>
            <span className={label}>
                {l}
                {o.required && " *"}
            </span>
            <input type={o.type ?? "text"} value={v[k]} onChange={set(k)} inputMode={o.inputMode} placeholder={o.placeholder} className={`${field} ${fieldBorder(fe[k])}`} aria-invalid={!!fe[k]} />
            {fe[k] ? <span className={errorText}>{fe[k]}</span> : o.hint ? <span className={hint}>{o.hint}</span> : null}
        </label>
    );

    return (
        <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
            {input("name", "Student's full name", { required: true, wide: true })}
            {input("dob", "Date of birth", { type: "date", required: true })}
            <fieldset>
                <legend className={label}>Gender *</legend>
                <div className="mt-1 flex gap-2">
                    {[
                        ["MALE", "Boy"],
                        ["FEMALE", "Girl"],
                    ].map(([val, text]) => (
                        <label key={val} className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border text-[15px] ${v.gender === val ? "border-brand bg-brand-soft font-semibold text-brand-deep" : fe.gender ? "border-coral" : "border-line"}`}>
                            <input type="radio" name="gender" value={val} checked={v.gender === val} onChange={set("gender")} className="sr-only" />
                            {text}
                        </label>
                    ))}
                </div>
                {fe.gender && <span className={errorText}>{fe.gender}</span>}
            </fieldset>
            <label>
                <span className={label}>Class *</span>
                <select value={v.sectionId} onChange={set("sectionId")} className={`${field} ${fieldBorder(fe.sectionId)}`}>
                    {sections.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
                {fe.sectionId && <span className={errorText}>{fe.sectionId}</span>}
            </label>
            {input("roll", "Roll", { type: "number", inputMode: "numeric", hint: isNew ? "Leave empty for the next free roll." : "Changing class without a roll gives the next free roll." })}
            {input("guardianPhone", "Guardian mobile", { type: "tel", inputMode: "tel", required: true, placeholder: "01XXXXXXXXX", hint: "Absent SMS, fee reminders and the portal use this number." })}
            {input("guardianPhone2", "Second mobile", { type: "tel", inputMode: "tel" })}
            {input("fatherName", "Father's name")}
            {input("motherName", "Mother's name")}
            {input("guardianName", "Guardian (if not a parent)")}
            {input("guardianEmail", "Guardian email", { type: "email", inputMode: "email" })}
            <label>
                <span className={label}>Blood group</span>
                <select value={v.bloodGroup} onChange={set("bloodGroup")} className={`${field} border-line`}>
                    {BLOOD.map((b) => (
                        <option key={b} value={b}>
                            {b || "Not known"}
                        </option>
                    ))}
                </select>
            </label>
            {input("admissionDate", "Admission date", { type: "date", hint: isNew ? "Empty = today." : undefined })}
            {input("address", "Address", { wide: true })}
            {!isNew && (
                <label className="sm:col-span-2">
                    <span className={label}>Status</span>
                    <select value={v.status} onChange={set("status")} className={`${field} border-line`}>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive (left for now)</option>
                        <option value="TRANSFERRED">Transferred to another school</option>
                        <option value="GRADUATED">Graduated</option>
                    </select>
                    <span className={hint}>Anything except Active turns off the guardian portal login. Records stay.</span>
                </label>
            )}
            {state.error && (
                <p role="alert" className="rounded-xl bg-coral-soft px-4 py-3 text-[14.5px] text-ink sm:col-span-2">
                    {state.error}
                </p>
            )}
            <div className="flex flex-wrap gap-2 sm:col-span-2">
                <button type="submit" disabled={state.busy} className="btn-primary min-h-11 text-[14.5px] disabled:opacity-60">
                    {state.busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : isNew ? <UserPlus className="size-4" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
                    {isNew ? "Admit student" : "Save profile"}
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="btn-ghost min-h-11 text-[14.5px]">
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
