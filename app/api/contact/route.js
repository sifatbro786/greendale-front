/**
 * POST /api/contact — DEMO contact form only (DATA_MODE=demo, Vercel client preview).
 * Validates exactly like the API and answers success, but sends nothing: the demo has no mail server.
 * Live mode never reaches this file: /api/* goes to Express (next.config rewrite locally, Nginx on the VPS),
 * which stores a ContactMessage and emails the office through the queue. Same request and envelope in both modes:
 *   200 { data: { sent: true } } · 400 BAD_REQUEST (details) · 413 · 415 · 429
 */
import { contactSchema } from "@/lib/server/contact-schema";
import { fail, guardJsonPost, issues, ok } from "@/lib/server/envelope";
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

    // Demo: nothing is sent or stored. Log only the subject so the Vercel log shows the form works.
    console.info(`[contact:demo] ${parsed.data.subject} enquiry received (not sent, demo mode)`);
    return ok({ sent: true });
}
