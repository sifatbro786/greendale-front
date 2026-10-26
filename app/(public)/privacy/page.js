import LegalPage, { legalMetadata } from "@/components/site/LegalPage";

export function generateMetadata() {
    return legalMetadata("privacy");
}

export default function PrivacyPage() {
    return <LegalPage slug="privacy" />;
}
