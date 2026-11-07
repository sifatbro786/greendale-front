/**
 * Small RFC 4180 CSV reader/writer (no dependency). Handles quotes, escaped quotes, commas and line
 * breaks inside quotes, CRLF, a UTF-8 BOM (Excel "CSV UTF-8") and semicolon files from some Excel locales.
 * Safe in the browser and on the server.
 */

/** @param {string} text @returns {string[][]} */
export function parseCsv(text) {
    const src = text.replace(/^﻿/, "");
    const firstLine = src.slice(0, src.indexOf("\n") === -1 ? undefined : src.indexOf("\n"));
    const sep = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
    for (let i = 0; i < src.length; i++) {
        const c = src[i];
        if (quoted) {
            if (c === '"' && src[i + 1] === '"') {
                cell += '"';
                i++;
            } else if (c === '"') quoted = false;
            else cell += c;
        } else if (c === '"') quoted = true;
        else if (c === sep) {
            row.push(cell);
            cell = "";
        } else if (c === "\n" || c === "\r") {
            if (c === "\r" && src[i + 1] === "\n") i++;
            row.push(cell);
            rows.push(row);
            row = [];
            cell = "";
        } else cell += c;
    }
    if (cell !== "" || row.length) {
        row.push(cell);
        rows.push(row);
    }
    return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

/** Values that start with = + - @ are prefixed with ' so Excel never runs them as formulas. */
const safe = (v) => {
    const s = v == null ? "" : String(v);
    const t = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return /[",\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};

/** @param {string[]} header @param {(string | number | null)[][]} rows */
export const toCsv = (header, rows) => "﻿" + [header, ...rows].map((r) => r.map(safe).join(",")).join("\r\n");

/** Browser download of a CSV string. */
export function downloadCsv(name, csv) {
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: name });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
