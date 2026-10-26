import { Clock, MapPin, Phone } from "lucide-react";

import ContactForm from "@/components/site/ContactForm";
import PageHeader from "@/components/site/PageHeader";
import { FacebookIcon, WhatsAppIcon, YouTubeIcon } from "@/components/site/SocialIcons";
import { school } from "@/config/school";

export const metadata = {
    title: "Contact",
    description: `Call or WhatsApp ${school.contact.phone}, or visit ${school.contact.addressShort}.`,
    alternates: { canonical: "/contact" },
};

export default function ContactPage() {
    const c = school.contact;
    const { lat, lng } = c.geo;
    const mapSrc = `https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
    const directions = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    return (
        <>
            <PageHeader title="Contact us" summary="Call, WhatsApp, send a message or simply drop by the campus." tone="brand" crumbs={[{ label: "Contact" }]} />
            <div className="container-x grid gap-10 py-14 lg:grid-cols-[1fr_1.15fr] lg:py-20">
                <div className="space-y-4">
                    <a href={c.phoneHref} className="flex items-center gap-4 rounded-[1.25rem] bg-white p-5 transition-shadow hover:shadow-md">
                        <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand"><Phone className="size-5" aria-hidden="true" /></span>
                        <span>
                            <span className="block text-[13.5px] text-ink-soft">Phone</span>
                            <span className="text-lg font-semibold text-ink">{c.phone}</span>
                        </span>
                    </a>
                    <a href={c.whatsappHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-[1.25rem] bg-white p-5 transition-shadow hover:shadow-md">
                        <span className="grid size-12 place-items-center rounded-2xl bg-[#e5f8ec] text-[#1a9e4b]"><WhatsAppIcon className="size-5" /></span>
                        <span>
                            <span className="block text-[13.5px] text-ink-soft">WhatsApp</span>
                            <span className="text-lg font-semibold text-ink">{c.whatsapp}</span>
                        </span>
                    </a>
                    <div className="flex items-start gap-4 rounded-[1.25rem] bg-white p-5">
                        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-coral-soft text-coral"><MapPin className="size-5" aria-hidden="true" /></span>
                        <span>
                            <span className="block text-[13.5px] text-ink-soft">Campus</span>
                            <span className="block font-semibold text-ink">{c.addressLines[0]}</span>
                            <span className="block text-ink-soft">{c.addressLines[1]}</span>
                            <a href={directions} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold text-brand-deep">Get directions →</a>
                        </span>
                    </div>
                    {c.officeHours && (
                        <div className="flex items-center gap-4 rounded-[1.25rem] bg-white p-5">
                            <span className="grid size-12 place-items-center rounded-2xl bg-sun-soft text-[#9a7400]"><Clock className="size-5" aria-hidden="true" /></span>
                            <span className="font-semibold text-ink">{c.officeHours}</span>
                        </div>
                    )}
                    <div className="flex gap-2.5 pt-2">
                        <a href={school.social.facebook} target="_blank" rel="noopener noreferrer" className="btn-ghost"><FacebookIcon className="size-4" /> Facebook</a>
                        <a href={school.social.youtube} target="_blank" rel="noopener noreferrer" className="btn-ghost"><YouTubeIcon className="size-4" /> YouTube</a>
                    </div>
                </div>

                <div className="rounded-[1.5rem] border border-line bg-white p-6 sm:p-9">
                    <h2 className="text-2xl font-semibold text-ink">Send a message</h2>
                    <p className="mt-1.5 mb-7 text-ink-soft">The office will get back to you as soon as possible.</p>
                    <ContactForm />
                </div>
            </div>
            <div className="container-x pb-20">
                <div className="overflow-hidden rounded-[1.5rem] border border-line bg-white">
                    <iframe
                        title={`Map: ${school.name}`}
                        src={mapSrc}
                        className="block h-[360px] w-full sm:h-[440px]"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
            </div>
        </>
    );
}
