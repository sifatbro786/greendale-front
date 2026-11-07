"use client";

import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";

/** Row buttons shared by the Videos / Facilities / Downloads managers. */
export default function ListActions({ onUp, onDown, onEdit, onDelete, first, last }) {
    const btn = "grid size-9 place-items-center rounded-lg text-ink-soft hover:bg-paper disabled:opacity-30";
    return (
        <div className="flex shrink-0 items-center">
            {onUp && (
                <button type="button" onClick={onUp} disabled={first} className={btn} aria-label="Move up">
                    <ArrowUp className="size-4" aria-hidden="true" />
                </button>
            )}
            {onDown && (
                <button type="button" onClick={onDown} disabled={last} className={btn} aria-label="Move down">
                    <ArrowDown className="size-4" aria-hidden="true" />
                </button>
            )}
            <button type="button" onClick={onEdit} className={btn} aria-label="Edit">
                <Pencil className="size-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={onDelete} className={`${btn} hover:bg-coral-soft hover:text-coral`} aria-label="Delete">
                <Trash2 className="size-4" aria-hidden="true" />
            </button>
        </div>
    );
}
