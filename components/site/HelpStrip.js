import { Phone } from "lucide-react";

import { school } from "@/config/school";

import { WhatsAppIcon } from "./SocialIcons";

/** Reusable "talk to the office" call-to-action. */
export default function HelpStrip({ title = "Have a question? The office is happy to help.", className = "" }) {
    const c = school.contact;
    return (
        <div className={`flex flex-col gap-5 rounded-[1.5rem] bg-brand-soft p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 ${className}`}>
            <p className="max-w-md text-lg font-semibold text-ink">{title}</p>
            <div className="flex flex-wrap gap-2.5">
                <a href={c.phoneHref} className="btn-primary">
                    <Phone className="size-4" aria-hidden="true" /> {c.phone}
                </a>
                <a href={c.whatsappHref} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-white hover:brightness-95">
                    <WhatsAppIcon className="size-4" /> WhatsApp
                </a>
            </div>
        </div>
    );
}
