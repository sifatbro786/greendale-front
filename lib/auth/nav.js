import { can } from "./permissions";

/**
 * Sidebar menus built from permissions (PRD §3.4: "menu is built from the user's permissions").
 * Items are plain data (icon = lucide icon name) so they can cross the server → client boundary.
 */
export function staffNav(role) {
    const teacher = role === "TEACHER";
    const groups = [
        { label: "Overview", items: [{ label: teacher ? "My Day" : "Dashboard", href: "/admin", icon: "LayoutDashboard", perm: "dashboard.view", exact: true }] },
        {
            label: "Academics",
            items: [
                { label: teacher ? "My Classes" : "Students", href: "/admin/students", icon: "Users", perm: "students.view" },
                { label: teacher ? "Take Attendance" : "Attendance", href: "/admin/attendance", icon: "CalendarCheck", perm: ["attendance.take", "attendance.view"] },
                { label: teacher ? "Marks Entry" : "Exams & Results", href: "/admin/exams", icon: "ClipboardList", perm: ["exams.manage", "marks.enter"] },
                { label: teacher ? "My Routine" : "Class Routine", href: "/admin/routine", icon: "CalendarClock", perm: "routine.view" },
                { label: "Classes & Subjects", href: "/admin/academics", icon: "Layers", perm: "academics.manage" },
                { label: "Teachers & Staff", href: "/admin/staff", icon: "GraduationCap", perm: "academics.manage" },
                { label: "Admit & ID Cards", href: "/admin/cards", icon: "IdCard", perm: "cards.generate" },
            ],
        },
        {
            label: "Finance",
            items: [
                { label: "Fees Overview", href: "/admin/fees", icon: "Wallet", perm: "fees.view", exact: true },
                { label: "Collect Fee", href: "/admin/fees/collect", icon: "HandCoins", perm: "fees.collect" },
                { label: "Payments", href: "/admin/fees/payments", icon: "ReceiptText", perm: "fees.view" },
            ],
        },
        {
            label: "Communication",
            items: [
                { label: "Notices", href: "/admin/notices", icon: "Megaphone", perm: null },
                { label: "SMS", href: "/admin/sms", icon: "MessageSquareText", perm: ["sms.send", "sms.dues"] },
                { label: "Website", href: "/admin/website", icon: "Globe", perm: "website.manage" },
            ],
        },
        {
            label: "Administration",
            items: [
                { label: "Users & Roles", href: "/admin/users", icon: "ShieldCheck", perm: "users.manage" },
                { label: "Settings", href: "/admin/settings", icon: "Settings", perm: "settings.manage" },
                { label: "Audit Log", href: "/admin/audit", icon: "History", perm: "audit.view" },
            ],
        },
    ];
    const allowed = (perm) => !perm || (Array.isArray(perm) ? perm.some((p) => can(role, p)) : can(role, perm));
    return groups
        .map((g) => ({ label: g.label, items: g.items.filter((i) => allowed(i.perm)).map(({ perm, ...rest }) => rest) }))
        .filter((g) => g.items.length);
}

export const portalNav = [
    {
        label: "Student",
        items: [
            { label: "Home", href: "/portal", icon: "House", exact: true },
            { label: "Results", href: "/portal/results", icon: "Award" },
            { label: "Attendance", href: "/portal/attendance", icon: "CalendarCheck" },
            { label: "Fees & Payments", href: "/portal/fees", icon: "Wallet" },
            { label: "Admit Card", href: "/portal/admit-card", icon: "IdCard" },
            { label: "Routine", href: "/portal/routine", icon: "CalendarClock" },
            { label: "Notices", href: "/portal/notices", icon: "Megaphone" },
            { label: "Profile", href: "/portal/profile", icon: "UserRound" },
        ],
    },
];
