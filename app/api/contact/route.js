/**
 * POST /api/contact — Phase 1 contact form (PRD §3.1).
 * zod validation, honeypot, same-origin + JSON content-type check, 5 requests / 10 min / IP, Nodemailer.
 * Phase 2: this handler is deleted and Express serves the same URL (Nginx routes /api → :4000),
 * storing a ContactMessage and sending the email through the BullMQ email queue.
 */
import { school } from "@/config/school";
import { contactSchema } from "@/lib/server/contact-schema";
import { escapeHtml, getTransporter } from "@/lib/server/mailer";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

const MAX_BODY = 10_000;
const json = (body, status = 200, headers = {}) => Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

export async function POST(request) {
    // CSRF hardening: JSON only, and the Origin (when sent) must match this host.
    if (!request.headers.get("content-type")?.includes("application/json")) {
        return json({ ok: false, message: "Unsupported content type." }, 415);
    }
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== request.headers.get("host")) {
        return json({ ok: false, message: "Forbidden." }, 403);
    }

    const ip = clientIp(request.headers);
    const rl = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
    if (!rl.ok) {
        return json({ ok: false, message: "Too many messages. Please try again in a few minutes, or call the office." }, 429, {
            "Retry-After": String(rl.retryAfter),
        });
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY) return json({ ok: false, message: "Message is too long." }, 413);

    let body;
    try {
        body = JSON.parse(raw);
    } catch {
        return json({ ok: false, message: "Invalid request." }, 400);
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
        const fieldErrors = {};
        for (const issue of parsed.error.issues) fieldErrors[issue.path[0]] ??= issue.message;
        // Honeypot hit: pretend success so bots learn nothing.
        if (fieldErrors.website) return json({ ok: true });
        return json({ ok: false, message: "Please check the highlighted fields.", fieldErrors }, 422);
    }

    const d = parsed.data;
    const transporter = getTransporter();
    const to = process.env.CONTACT_TO || school.contact.email;
    if (!transporter || !to) {
        console.error("[contact] SMTP or CONTACT_TO not configured");
        return json({ ok: false, message: `Our message service is not ready yet. Please call ${school.contact.phone}.` }, 503);
    }

    const rows = [
        ["Name", d.name],
        ["Phone", d.phone],
        ["Email", d.email || "-"],
        ["Subject", d.subject],
        ["Message", d.message],
    ];
    try {
        await transporter.sendMail({
            from: process.env.MAIL_FROM || process.env.SMTP_USER,
            to,
            replyTo: d.email || undefined,
            subject: `[Website] ${d.subject} enquiry from ${d.name}`,
            text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
            html: `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px">${rows
                .map(([k, v]) => `<tr><td style="color:#555;vertical-align:top"><b>${k}</b></td><td style="white-space:pre-wrap">${escapeHtml(v)}</td></tr>`)
                .join("")}</table><p style="color:#888;font-size:12px">Sent from the website contact form · IP ${escapeHtml(ip)}</p>`,
        });
    } catch (err) {
        console.error("[contact] sendMail failed", err?.message);
        return json({ ok: false, message: `We could not send your message. Please call ${school.contact.phone}.` }, 502);
    }

    return json({ ok: true });
}
