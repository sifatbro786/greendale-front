import { z } from "zod";

/** Bangladesh mobile: 01XXXXXXXXX, optional +88 / 88 prefix, spaces or dashes allowed. */
const BD_MOBILE = /^(?:\+?88)?01[3-9]\d{8}$/;

export const contactSchema = z.object({
    name: z.string().trim().min(2, "Please write your name.").max(80),
    phone: z
        .string()
        .trim()
        .transform((v) => v.replace(/[\s-]/g, ""))
        .refine((v) => BD_MOBILE.test(v), "Please give a valid Bangladeshi mobile number."),
    email: z.union([z.literal(""), z.string().trim().email("This email address does not look right.").max(120)]).optional(),
    subject: z.enum(["admission", "general", "fees", "other"]).default("general"),
    message: z.string().trim().min(10, "Please write a little more (at least 10 characters).").max(1500),
    // Honeypot: real people never fill this hidden field.
    website: z.string().max(0).optional().or(z.literal("")),
});
