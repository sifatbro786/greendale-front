import { ShieldCheck } from "lucide-react";

import LoginForm from "@/components/site/LoginForm";
import Photo from "@/components/ui/Photo";
import { img } from "@/content/media";

export const metadata = {
    title: "Portal Login",
    description: "Login for guardians, students, teachers and school staff.",
    robots: { index: false },
};

/* One login for staff and guardians; redirects by role (/admin or /portal). */
export default function LoginPage() {
    return (
        <section className="container-x py-10 sm:py-16">
            <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-line bg-white lg:grid-cols-[1fr_1.05fr]">
                <div className="relative hidden min-h-[560px] lg:block">
                    <Photo image={img.birthday} fill ratio={460 / 640} sizes="460px" priority />
                    <div className="absolute inset-0 bg-linear-to-t from-[#06321a]/90 via-[#06321a]/35 to-transparent" />
                    <div className="absolute right-8 bottom-8 left-8 text-white">
                        <p className="inline-flex -rotate-1 rounded-full bg-sun px-3 py-1 text-[13px] font-semibold text-ink">Greendale Portal</p>
                        <p className="mt-4 text-3xl leading-tight font-semibold">Results, attendance, fees and notices, all in one place.</p>
                    </div>
                </div>
                <div className="p-6 sm:p-10">
                    <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
                        <ShieldCheck className="size-6" aria-hidden="true" />
                    </span>
                    <h1 className="mt-5 text-3xl font-semibold text-ink">Sign in</h1>
                    <p className="mt-1.5 mb-8 text-ink-soft">For guardians, students, teachers and school staff.</p>
                    <LoginForm />
                </div>
            </div>
        </section>
    );
}
