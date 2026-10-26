import About from "@/components/home/About";
import AdmissionVisit from "@/components/home/AdmissionVisit";
import CampusLife from "@/components/home/CampusLife";
import Chairman from "@/components/home/Chairman";
import Classroom from "@/components/home/Classroom";
import FactsBand from "@/components/home/FactsBand";
import GalleryStrip from "@/components/home/GalleryStrip";
import GuardianVideo from "@/components/home/GuardianVideo";
import Hero from "@/components/home/Hero";
import Programs from "@/components/home/Programs";
import SpecialityRibbon from "@/components/home/SpecialityRibbon";
import Updates from "@/components/home/Updates";
import WhyUs from "@/components/home/WhyUs";
import PublicShell from "@/components/site/PublicShell";
import { school } from "@/config/school";
import { getAdmissionGuide, getClasses, getNews, getNotices } from "@/lib/data";

export default async function HomePage() {
    const [classes, notices, news, admission] = await Promise.all([
        getClasses(),
        getNotices({ limit: 4 }),
        getNews({ limit: 3 }),
        getAdmissionGuide(),
    ]);

    // Home sits at app/page.js (not inside the (public) group) so it shares the shell explicitly.
    return (
        <PublicShell>
            <SchoolJsonLd />
            <Hero />
            <SpecialityRibbon />
            <About />
            <FactsBand />
            <Programs classes={classes} />
            <CampusLife />
            <WhyUs />
            <Chairman />
            <Classroom />
            <Updates notices={notices} news={news} />
            <GalleryStrip />
            <GuardianVideo />
            <AdmissionVisit steps={admission.steps} />
        </PublicShell>
    );
}

function SchoolJsonLd() {
    const c = school.contact;
    const data = {
        "@context": "https://schema.org",
        "@type": "ElementarySchool",
        name: school.name,
        description: school.description,
        url: school.siteUrl,
        logo: new URL(school.logo.full, school.siteUrl).toString(),
        telephone: c.phone.replace(/[\s-]/g, ""),
        foundingDate: String(school.established),
        address: {
            "@type": "PostalAddress",
            streetAddress: c.addressLines[0],
            addressLocality: "Mirpur, Dhaka",
            postalCode: "1216",
            addressCountry: "BD",
        },
        geo: { "@type": "GeoCoordinates", latitude: c.geo.lat, longitude: c.geo.lng },
        sameAs: [school.social.facebook, school.social.youtube],
        founder: { "@type": "Person", name: school.leadership.chairman.name },
    };
    return (
        <script
            type="application/ld+json"
            // JSON from our own config; escape "<" so it can never close the script tag.
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
        />
    );
}
