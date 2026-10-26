import ComingSoon from "@/components/site/ComingSoon";

export const metadata = {
    title: "Portal Login",
    description: "Login for guardians, students, teachers and school staff.",
    robots: { index: false },
};

/* Phase 3: one login for staff and guardians, redirects by role (/admin or /portal). */
export default function LoginPage() {
    return (
        <ComingSoon
            title="Portal login opens soon"
            text="Guardians will see results, attendance, fees and notices here. Teachers and staff will use the same login. Your login details will be given by the school office."
        />
    );
}
