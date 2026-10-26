/**
 * RBAC — permission strings (PRD §5). Roles are permission sets; Phase 2 stores them in the Role table
 * (Role.permissions text[]) and the API enforces them. The UI only uses them to build menus.
 */

export const ROLES = {
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN", // Principal / Admin
    OFFICE: "OFFICE",
    ACCOUNTANT: "ACCOUNTANT",
    TEACHER: "TEACHER",
    STUDENT: "STUDENT", // student + guardian portal
};

export const ROLE_LABEL = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Principal / Admin",
    OFFICE: "Office Staff",
    ACCOUNTANT: "Accountant",
    TEACHER: "Teacher",
    STUDENT: "Student / Guardian",
};

/** Every permission in the system, grouped for the roles matrix. */
export const PERMISSION_GROUPS = [
    { module: "Dashboard", perms: [["dashboard.view", "View dashboard"]] },
    { module: "Website content", perms: [["website.manage", "Manage pages, news, gallery"], ["notices.manage", "Post and pin notices"]] },
    { module: "Students & classes", perms: [["students.view", "View students"], ["students.manage", "Add, edit, promote, import"], ["academics.manage", "Sessions, classes, subjects"]] },
    { module: "Attendance", perms: [["attendance.take", "Take attendance"], ["attendance.view", "Attendance reports"]] },
    { module: "Exams & results", perms: [["exams.manage", "Create exams, set marks"], ["marks.enter", "Enter marks"], ["results.publish", "Publish / unpublish results"]] },
    { module: "Routine", perms: [["routine.manage", "Edit class routine"], ["routine.view", "View routines"]] },
    { module: "Cards", perms: [["cards.generate", "Admit & ID cards"]] },
    { module: "Fees", perms: [["fees.view", "View fees & reports"], ["fees.collect", "Collect payments"], ["fees.manage", "Fee setup, reversals"]] },
    { module: "SMS", perms: [["sms.send", "Send SMS"], ["sms.dues", "Send due reminders only"]] },
    { module: "Administration", perms: [["users.manage", "Users & roles"], ["settings.manage", "School settings"], ["audit.view", "Audit log"]] },
];

const ALL = PERMISSION_GROUPS.flatMap((g) => g.perms.map(([p]) => p));

export const ROLE_PERMISSIONS = {
    SUPER_ADMIN: ALL,
    ADMIN: ALL.filter((p) => !["users.manage", "settings.manage", "fees.collect", "fees.manage"].includes(p)),
    OFFICE: ["dashboard.view", "website.manage", "notices.manage", "students.view", "students.manage", "academics.manage", "attendance.view", "routine.manage", "routine.view", "cards.generate", "sms.send"],
    ACCOUNTANT: ["dashboard.view", "students.view", "fees.view", "fees.collect", "fees.manage", "sms.dues"],
    TEACHER: ["dashboard.view", "students.view", "attendance.take", "marks.enter", "routine.view"],
    STUDENT: [],
};

/** @param {string} role @param {string} perm */
export function can(role, perm) {
    return (ROLE_PERMISSIONS[role] || []).includes(perm);
}

/** Where each role lands after login. */
export function homeFor(role) {
    return role === ROLES.STUDENT ? "/portal" : "/admin";
}
