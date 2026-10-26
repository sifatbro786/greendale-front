import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

import { students } from "@/lib/demo/seed";

/**
 * DEMO accounts (no database yet). Passwords are stored as salted SHA-256 so they never sit in
 * plain text in the repo or the client bundle. Phase 2: User table with argon2id hashes + lockout.
 *
 * Shown on the login page for the demo: admin, teacher and student. The super admin is NOT shown.
 */
const USERS = [
    {
        id: "usr-super",
        identifier: "solaimanislamsifat@gmail.com",
        name: "Super Admin",
        role: "SUPER_ADMIN",
        salt: "sa-gd-01",
        hash: "cec4f39af2b4c59fca1b1172d667915714ec3e027d430ce11730457aaaa8464c",
    },
    {
        id: "usr-admin",
        identifier: "admin@greendale.demo",
        name: "Mahmuda Khanam",
        title: "Principal",
        role: "ADMIN",
        salt: "ad-gd-02",
        hash: "75349a8d634254b7664426dd39462645843ac4ea4eaf555a6dc4af3e6d1846c1",
    },
    {
        id: "usr-t02",
        staffId: "t02",
        identifier: "teacher@greendale.demo",
        name: "Farzana Rahman",
        title: "Senior Teacher",
        role: "TEACHER",
        salt: "te-gd-03",
        hash: "b66b8d8a6da57d11c6deba5f1ef77cf45cc979619d5890fbaf32d2f5bafc18d4",
    },
    {
        id: "usr-stu-109",
        studentId: "stu-109",
        identifier: "gevs-26109",
        name: "Nusaiba Uddin",
        role: "STUDENT",
        salt: "st-gd-04",
        hash: "4d7859119c9ab9cbea5a62120fd6234b972325a4120d338350955d9295bcd751",
    },
];

/** @returns {Omit<typeof USERS[number], "salt" | "hash"> | null} */
export function verifyCredentials(identifier, password) {
    const id = String(identifier || "").trim().toLowerCase();
    const user = USERS.find((u) => u.identifier === id);
    // Always hash, even for unknown users, so response time does not reveal which accounts exist.
    const candidate = createHash("sha256").update(`${user?.salt ?? "x"}:${password}`).digest();
    if (!user) return null;
    const ok = timingSafeEqual(candidate, Buffer.from(user.hash, "hex"));
    if (!ok) return null;
    return findUser(user.id);
}

export function findUser(id) {
    const u = USERS.find((x) => x.id === id);
    if (!u) return null;
    const { salt, hash, ...safe } = u;
    // Student display name comes from the student record (demo seed now, Student table later).
    if (safe.studentId) safe.name = students.find((s) => s.id === safe.studentId)?.name ?? safe.name;
    return safe;
}
