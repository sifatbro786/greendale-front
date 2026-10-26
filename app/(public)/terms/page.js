import LegalPage, { legalMetadata } from "@/components/site/LegalPage";

export function generateMetadata() {
    return legalMetadata("terms");
}

export default function TermsPage() {
    return <LegalPage slug="terms" />;
}
