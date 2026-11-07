import "server-only";

import { school } from "@/config/school";

/** Demo settings (live: GET /api/settings). Built from config/school.js so the demo shows real values. */
export async function getSettings() {
    return {
        "school.profile": {
            name: school.name,
            shortName: school.shortName,
            eiin: school.eiin,
            established: school.established,
            contact: { phone: school.contact.phone, whatsapp: school.contact.whatsapp ?? "", email: school.contact.email ?? "", addressLines: school.contact.addressLines, addressShort: school.contact.addressShort, officeHours: school.contact.officeHours ?? "" },
            social: { facebook: school.social.facebook ?? "", youtube: school.social.youtube ?? "" },
        },
        "modules.enabled": school.enabledModules,
        "ids.studentUidPrefix": "GEVS-",
        "fees.receiptPrefix": "GEVS",
        "fees.autoInvoiceDay": 1,
        "attendance.weeklyOff": ["FRI", "SAT"],
        "attendance.smsCutoff": "10:30",
        "results.tieBreak": "roll",
        "cards.admitDueLimit": 3000,
    };
}
