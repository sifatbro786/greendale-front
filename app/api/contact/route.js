/**
 * POST /api/contact — DEMO contact form (DATA_MODE=demo, Vercel): sends the email directly with Nodemailer.
 * Live mode: /api/* goes to Express (next.config rewrite locally, Nginx on the VPS), which stores a
 * ContactMessage and emails through the queue. Same request and envelope in both modes:
 *   200 { data: { sent: true } } · 400 BAD_REQUEST (details) · 413 · 415 · 429 · 502/503
 */
import { school } from "@/config/school";
import { contactSchema } from "@/lib/server/contact-schema";
import { fail, guardJsonPost, issues, ok } from "@/lib/server/envelope";
import { escapeHtml, getTransporter } from "@/lib/server/mailer";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

const MAX_BODY = 10_000;

export async function POST(request) {
    // CSRF hardening: JSON only, and the Origin (when sent) must match this host.
    const stop = guardJsonPost(request);
    if (stop) return stop;

    const ip = clientIp(request.headers);
    const rl = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
    if (!rl.ok) {
        return fail(429, "TOO_MANY_REQUESTS", "Too many messages. Please try again in a few minutes, or call the office.", undefined, {
            "Retry-After": String(rl.retryAfter),
        });
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY) return fail(413, "PAYLOAD_TOO_LARGE", "Message is too long.");

    let body;
    try {
        body = JSON.parse(raw);
    } catch {
        return fail(400, "BAD_REQUEST", "Malformed JSON body");
    }

    // Honeypot hit: pretend success so bots learn nothing.
    if (body?.website) return ok({ sent: true });
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) return fail(400, "BAD_REQUEST", "Invalid request", issues(parsed.error));

    const d = parsed.data;
    const transporter = getTransporter();
    const to = process.env.CONTACT_TO || school.contact.email;
    if (!transporter || !to) {
        console.error("[contact] SMTP or CONTACT_TO not configured");
        return fail(503, "SERVICE_UNAVAILABLE", `Our message service is not ready yet. Please call ${school.contact.phone}.`);
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
        return fail(502, "BAD_GATEWAY", `We could not send your message. Please call ${school.contact.phone}.`);
    }

    return ok({ sent: true });
}
