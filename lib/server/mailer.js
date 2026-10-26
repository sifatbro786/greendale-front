import nodemailer from "nodemailer";

let transporter;

/** Single pooled SMTP transporter (PRD §10.1). Returns null when SMTP env is not configured. */
export function getTransporter() {
    if (transporter !== undefined) return transporter;
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        transporter = null;
        return transporter;
    }
    const port = Number(SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure: port === 465,
        pool: true,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    return transporter;
}

export const escapeHtml = (s = "") =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
