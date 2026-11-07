"use client";

import { ArrowDown, ArrowUp, Check, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";

import { field, label } from "../admin/fields";
import { Badge, Card } from "../ui";
import { useApiAction } from "./useApiAction";

const small = "rounded-lg border border-line bg-white px-3 py-2 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10";
const iconBtn = "grid size-9 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-paper disabled:opacity-30";

/**
 * One class: details, sections (+ class teacher), subjects, and subject teachers per section,
 * all for the current session. Every change saves immediately through /api/academics/*.
 * @param {{ cls: any, staff: { id: string, name: string }[], demo?: boolean }} props
 */
export default function ClassManager({ cls: initial, staff, demo = false }) {
    const { busy, run } = useApiAction({ demo });
    const [cls, setCls] = useState(initial);
    const apply = { onData: (d) => d && setCls(d) };
    const teacherName = Object.fromEntries(staff.map((s) => [s.id, s.name]));

    return (
        <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
            <div className="space-y-4">
                <Details cls={cls} busy={busy} run={run} apply={apply} />
                <Sections cls={cls} staff={staff} busy={busy} run={run} apply={apply} />
                <Subjects cls={cls} busy={busy} run={run} apply={apply} />
            </div>
            <div className="space-y-4">
                {cls.sections.map((s) => (
                    <Assignments
                        key={`${s.id}-${s.assignments.map((a) => a.subjectId + a.staffId).join()}`}
                        cls={cls}
                        section={s}
                        staff={staff}
                        teacherName={teacherName}
                        busy={busy}
                        run={run}
                        apply={apply}
                    />
                ))}
            </div>
        </div>
    );
}

function Details({ cls, busy, run, apply }) {
    const [v, setV] = useState({ name: cls.name, gradingMode: cls.gradingMode });
    const dirty = v.name !== cls.name || v.gradingMode !== cls.gradingMode;
    return (
        <Card title="Class">
            <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                <label>
                    <span className={label}>Name</span>
                    <input value={v.name} onChange={(e) => setV((s) => ({ ...s, name: e.target.value }))} className={`${field} border-line`} />
                </label>
                <label>
                    <span className={label}>Results</span>
                    <select value={v.gradingMode} onChange={(e) => setV((s) => ({ ...s, gradingMode: e.target.value }))} className={`${field} border-line`}>
                        <option value="MARKS">Marks & GPA</option>
                        <option value="REMARKS">Remarks only</option>
                    </select>
                </label>
            </div>
            <button
                type="button"
                disabled={!dirty || busy}
                onClick={() => run(`/api/academics/classes/${cls.id}`, "PATCH", v, { ...apply, success: "Class saved." })}
                className="btn-primary mt-3 min-h-10 text-[14px] disabled:opacity-50"
            >
                <Save className="size-4" aria-hidden="true" /> Save
            </button>
        </Card>
    );
}

function Sections({ cls, staff, busy, run, apply }) {
    const [name, setName] = useState("");
    const [editing, setEditing] = useState(null);
    return (
        <Card title="Sections" description={`Class teachers for session ${cls.session.name}`} padded={false}>
            <ul className="divide-y divide-line">
                {cls.sections.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center gap-2 px-5 py-3">
                        {editing?.id === s.id ? (
                            <span className="flex items-center gap-1">
                                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={`${small} w-24`} aria-label="Section name" />
                                <button
                                    type="button"
                                    className={iconBtn}
                                    aria-label="Save name"
                                    onClick={async () => (await run(`/api/academics/sections/${s.id}`, "PATCH", { name: editing.name }, apply)) && setEditing(null)}
                                >
                                    <Check className="size-4" aria-hidden="true" />
                                </button>
                                <button type="button" className={iconBtn} aria-label="Cancel" onClick={() => setEditing(null)}>
                                    <X className="size-4" aria-hidden="true" />
                                </button>
                            </span>
                        ) : (
                            <span className="flex items-center gap-1">
                                <span className="w-24 font-semibold text-ink">Section {s.name}</span>
                                <button type="button" className={iconBtn} aria-label={`Rename section ${s.name}`} onClick={() => setEditing({ id: s.id, name: s.name })}>
                                    <Pencil className="size-4" aria-hidden="true" />
                                </button>
                            </span>
                        )}
                        <select
                            value={s.classTeacherId ?? ""}
                            disabled={busy}
                            onChange={(e) => run(`/api/academics/sections/${s.id}/class-teacher`, "PUT", { staffId: e.target.value || null }, { ...apply, success: "Class teacher saved." })}
                            className={`${small} min-w-0 flex-1`}
                            aria-label={`Class teacher of section ${s.name}`}
                        >
                            <option value="">No class teacher</option>
                            {staff.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                        {!s.hasStudents && cls.sections.length > 1 && (
                            <button
                                type="button"
                                className={`${iconBtn} hover:bg-coral-soft hover:text-coral`}
                                aria-label={`Delete section ${s.name}`}
                                onClick={() => run(`/api/academics/sections/${s.id}`, "DELETE", undefined, { ...apply, success: "Section deleted." })}
                            >
                                <Trash2 className="size-4" aria-hidden="true" />
                            </button>
                        )}
                    </li>
                ))}
            </ul>
            <form
                className="flex gap-2 border-t border-line px-5 py-3"
                onSubmit={async (e) => {
                    e.preventDefault();
                    if (name.trim() && (await run(`/api/academics/classes/${cls.id}/sections`, "POST", { name: name.trim() }, { ...apply, success: `Section ${name.trim()} added.` }))) setName("");
                }}
            >
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New section, e.g. B" className={`${small} min-w-0 flex-1`} aria-label="New section name" />
                <button type="submit" disabled={busy || !name.trim()} className="btn-ghost min-h-10 text-[14px]">
                    <Plus className="size-4" aria-hidden="true" /> Add
                </button>
            </form>
        </Card>
    );
}

function Subjects({ cls, busy, run, apply }) {
    const [v, setV] = useState({ name: "", code: "" });
    const [editing, setEditing] = useState(null);
    const list = cls.subjects;
    const move = (i, dir) => {
        const ids = list.map((s) => s.id);
        const j = i + dir;
        [ids[i], ids[j]] = [ids[j], ids[i]];
        run(`/api/academics/classes/${cls.id}/subjects/order`, "PUT", { ids }, apply);
    };
    return (
        <Card title="Subjects" description="Turned-off subjects keep their old marks but are left out of new exams and routines." padded={false}>
            <ul className="divide-y divide-line">
                {list.map((s, i) => (
                    <li key={s.id} className={`flex items-center gap-2 px-5 py-2.5 ${s.isActive ? "" : "opacity-60"}`}>
                        {editing?.id === s.id ? (
                            <>
                                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={`${small} min-w-0 flex-1`} aria-label="Subject name" />
                                <input
                                    value={editing.code}
                                    onChange={(e) => setEditing({ ...editing, code: e.target.value })}
                                    placeholder="Code"
                                    className={`${small} w-20`}
                                    aria-label="Subject code"
                                />
                                <button
                                    type="button"
                                    className={iconBtn}
                                    aria-label="Save subject"
                                    onClick={async () => (await run(`/api/academics/subjects/${s.id}`, "PATCH", { name: editing.name, code: editing.code || null }, apply)) && setEditing(null)}
                                >
                                    <Check className="size-4" aria-hidden="true" />
                                </button>
                                <button type="button" className={iconBtn} aria-label="Cancel" onClick={() => setEditing(null)}>
                                    <X className="size-4" aria-hidden="true" />
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="min-w-0 flex-1 text-[15px] text-ink">
                                    {s.name} {s.code && <span className="text-[12.5px] text-ink-soft">· {s.code}</span>} {!s.isActive && <Badge>Off</Badge>}
                                </span>
                                <button type="button" className={iconBtn} onClick={() => move(i, -1)} disabled={i === 0 || busy} aria-label="Move up">
                                    <ArrowUp className="size-4" aria-hidden="true" />
                                </button>
                                <button type="button" className={iconBtn} onClick={() => move(i, 1)} disabled={i === list.length - 1 || busy} aria-label="Move down">
                                    <ArrowDown className="size-4" aria-hidden="true" />
                                </button>
                                <button type="button" className={iconBtn} onClick={() => setEditing({ id: s.id, name: s.name, code: s.code ?? "" })} aria-label={`Edit ${s.name}`}>
                                    <Pencil className="size-4" aria-hidden="true" />
                                </button>
                                {s.inUse ? (
                                    <button
                                        type="button"
                                        className="shrink-0 rounded-lg px-2 py-1.5 text-[12.5px] font-semibold text-ink-soft hover:bg-paper"
                                        onClick={() => run(`/api/academics/subjects/${s.id}`, "PATCH", { isActive: !s.isActive }, apply)}
                                    >
                                        {s.isActive ? "Turn off" : "Turn on"}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className={`${iconBtn} hover:bg-coral-soft hover:text-coral`}
                                        onClick={() => run(`/api/academics/subjects/${s.id}`, "DELETE", undefined, { ...apply, success: `${s.name} deleted.` })}
                                        aria-label={`Delete ${s.name}`}
                                    >
                                        <Trash2 className="size-4" aria-hidden="true" />
                                    </button>
                                )}
                            </>
                        )}
                    </li>
                ))}
            </ul>
            <form
                className="flex gap-2 border-t border-line px-5 py-3"
                onSubmit={async (e) => {
                    e.preventDefault();
                    if (
                        v.name.trim() &&
                        (await run(`/api/academics/classes/${cls.id}/subjects`, "POST", { name: v.name.trim(), code: v.code.trim() || null }, { ...apply, success: `${v.name.trim()} added.` }))
                    )
                        setV({ name: "", code: "" });
                }}
            >
                <input value={v.name} onChange={(e) => setV((s) => ({ ...s, name: e.target.value }))} placeholder="New subject" className={`${small} min-w-0 flex-1`} aria-label="New subject name" />
                <input value={v.code} onChange={(e) => setV((s) => ({ ...s, code: e.target.value }))} placeholder="Code" className={`${small} w-20`} aria-label="New subject code" />
                <button type="submit" disabled={busy || !v.name.trim()} className="btn-ghost min-h-10 text-[14px]">
                    <Plus className="size-4" aria-hidden="true" /> Add
                </button>
            </form>
        </Card>
    );
}

function Assignments({ cls, section, staff, busy, run, apply }) {
    const initial = Object.fromEntries(section.assignments.map((a) => [a.subjectId, a.staffId]));
    const [map, setMap] = useState(initial);
    const subjects = cls.subjects.filter((s) => s.isActive);
    const changed = subjects.filter((s) => (map[s.id] ?? null) !== (initial[s.id] ?? null));
    return (
        <Card title={`Subject teachers · Section ${section.name}`} description={`Session ${cls.session.name}. Teachers see and enter marks only for these.`} padded={false}>
            <ul className="divide-y divide-line">
                {subjects.map((s) => (
                    <li key={s.id} className="flex flex-col gap-1.5 px-5 py-2.5 sm:flex-row sm:items-center sm:gap-3">
                        <span className="text-[15px] text-ink sm:w-56 sm:shrink-0">{s.name}</span>
                        <select
                            value={map[s.id] ?? ""}
                            onChange={(e) => setMap((m) => ({ ...m, [s.id]: e.target.value || null }))}
                            className={`${small} w-full`}
                            aria-label={`Teacher for ${s.name}, section ${section.name}`}
                        >
                            <option value="">Not assigned</option>
                            {staff.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </li>
                ))}
            </ul>
            <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
                <span className="text-[13px] text-ink-soft">{changed.length ? `${changed.length} unsaved change${changed.length === 1 ? "" : "s"}` : "All saved"}</span>
                <button
                    type="button"
                    disabled={!changed.length || busy}
                    onClick={() =>
                        run(
                            `/api/academics/sections/${section.id}/assignments`,
                            "PUT",
                            { items: changed.map((s) => ({ subjectId: s.id, staffId: map[s.id] ?? null })) },
                            { ...apply, success: `Subject teachers of section ${section.name} saved.` },
                        )
                    }
                    className="btn-primary min-h-10 text-[14px] disabled:opacity-50"
                >
                    <Save className="size-4" aria-hidden="true" /> Save
                </button>
            </div>
        </Card>
    );
}
