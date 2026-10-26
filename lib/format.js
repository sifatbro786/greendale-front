const TZ = "Asia/Dhaka";

/** "20 Oct 2026" in Dhaka time regardless of server timezone. */
export function formatDate(iso, opts = { day: "numeric", month: "short", year: "numeric" }) {
    return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, ...opts }).format(new Date(iso));
}

/** { day: "20", month: "Oct" } for date badges. */
export function dateParts(iso) {
    const d = new Date(iso);
    return {
        day: new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "2-digit" }).format(d),
        month: new Intl.DateTimeFormat("en-GB", { timeZone: TZ, month: "short" }).format(d),
        year: new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric" }).format(d),
    };
}

/** Strip tags for meta descriptions. Input is trusted CMS HTML. */
export function plainText(html = "", max = 160) {
    const t = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

export const toneClasses = {
    coral: { bg: "bg-coral-soft", solid: "bg-coral", text: "text-coral", ring: "ring-coral/30" },
    sun: { bg: "bg-sun-soft", solid: "bg-sun", text: "text-[#9a7400]", ring: "ring-sun/40" },
    sky: { bg: "bg-sky-soft", solid: "bg-sky", text: "text-sky", ring: "ring-sky/30" },
    brand: { bg: "bg-brand-soft", solid: "bg-brand", text: "text-brand", ring: "ring-brand/30" },
};

/** Integer taka → "৳ 1,23,450" (Bangladeshi lakh grouping). */
export function formatMoney(n) {
    return `৳ ${new Intl.NumberFormat("en-IN").format(Math.round(n || 0))}`;
}

/** "26 Oct 2026, 10:42 AM" in Dhaka time. */
export function formatDateTime(iso) {
    return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(iso));
}

export function initials(name = "") {
    return name
        .replace(/^Md\.\s*/i, "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0].toUpperCase())
        .join("");
}
