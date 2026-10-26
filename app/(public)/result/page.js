import ComingSoon from "@/components/site/ComingSoon";

export const metadata = {
    title: "Online Result",
    description: "Search Greendale exam results by class, roll, exam and date of birth.",
    alternates: { canonical: "/result" },
};

/* Phase 3: public result search (class + roll + exam + DOB, captcha, 10/min per IP). */
export default function ResultPage() {
    return (
        <ComingSoon
            title="Online Result is coming soon"
            text="Soon you will be able to find your child's result here with class, roll, exam and date of birth. Results will also appear in the guardian portal."
        />
    );
}
