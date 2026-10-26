/**
 * School configuration — the ONLY place school-specific identity lives.
 * To launch the platform for another school, duplicate this file's values
 * (and replace /content in Phase 1, or the database from Phase 2).
 * Never write `if (school === ...)` anywhere in the codebase.
 */

/**
 * @typedef {Object} SchoolTheme
 * @property {string} brand        Primary brand colour (logo shield)
 * @property {string} brandDeep    Darker brand tone (logo wordmark)
 * @property {string} brandSoft    Very light brand tint for surfaces
 * @property {string} sun          Accent from the logo flame
 * @property {string} sunSoft
 * @property {string} sky          Playful accent
 * @property {string} skySoft
 * @property {string} coral        Playful accent
 * @property {string} coralSoft
 * @property {string} paper        Warm page background
 * @property {string} ink          Body text colour
 */

export const school = {
    name: "Greendale English Version School",
    shortName: "Greendale",
    tagline: "Quality English Version education from Play Group to Class V.",
    description:
        "Greendale English Version School in Mirpur, Dhaka provides quality English Version education from Play Group to Class V, with AC classrooms, a kids' play zone, free Arabic learning and special focus on handwriting, spoken English and phonics.",
    established: 2024, // from the logo ("ESTD. 2024")
    firstSessionStarted: "2025-01-01", // founding date given by the school
    eiin: "484897",
    levels: "Play Group to Class V",

    logo: {
        crest: "/images/logo-crest.png", // transparent, trimmed crest
        full: "/images/logo.jpg",
        width: 561,
        height: 600,
    },

    leadership: {
        chairman: {
            name: "Hafiz Uddin",
            knownAs: "Aynal Sir",
            title: "Director & Chairman",
        },
        // principal: { name: "", title: "Principal" }, // TODO: waiting for school
    },

    contact: {
        phone: "+880 1720-836744",
        phoneHref: "tel:+8801720836744",
        whatsapp: "+880 1720-836744",
        whatsappHref: "https://wa.me/8801720836744",
        email: "", // TODO: school mailbox not provided yet
        addressLines: ["Commerce Coaching Home, 27 C/A, 1st Colony", "Mirpur, Dhaka 1216, Bangladesh"],
        addressShort: "27 C/A, 1st Colony, Mirpur, Dhaka 1216",
        geo: { lat: 23.787649764369, lng: 90.345936566591 },
        officeHours: "", // TODO: confirm office hours with the school
    },

    social: {
        facebook: "https://www.facebook.com/greendaleenglishversionschool",
        youtube: "https://www.youtube.com/@greendaleenglishversionschool",
    },

    videos: {
        // YouTube ids — rendered with a click-to-load facade (no iframe until tapped)
        chairmanTalk: { id: "rbTnYXz3gs8", title: "Director & Chairman's talk and school overview" },
        guardianGuide: { id: "NKXTekrA2QM", title: "A must-watch for every Greendale student and guardian" },
    },

    specialities: [
        "English Version",
        "AC Classrooms",
        "Kids' Play Zone",
        "Free Arabic Learning",
        "Qualified Teachers",
        "Handwriting, Spoken English & Phonics",
    ],

    /** @type {SchoolTheme} */
    theme: {
        brand: "#1F8D46",
        brandDeep: "#0B5A2C",
        brandSoft: "#E7F4EA",
        sun: "#FFD23F",
        sunSoft: "#FFF4CC",
        sky: "#2E9BD6",
        skySoft: "#E2F2FB",
        coral: "#F2704E",
        coralSoft: "#FDE9E2",
        paper: "#FBF8F1",
        ink: "#15241B",
    },

    /** Modules switched on for this school. Phase 3 reads this for /admin and /portal menus. */
    enabledModules: ["cms", "students", "results", "attendance", "routine", "cards", "fees", "sms", "portal"],

    /** Public site URL. Override with NEXT_PUBLIC_SITE_URL (Vercel preview / VPS domain). */
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://greendale-school.vercel.app",
};

/** Primary navigation. Kept in config so another school can rename/hide items. */
export const navigation = [
    {
        label: "About",
        href: "/about/introduction",
        children: [
            { label: "Introduction", href: "/about/introduction" },
            { label: "Our Story", href: "/about/our-story" },
            { label: "Chairman's Message", href: "/about/chairman-message" },
            { label: "Vision & Mission", href: "/about/vision-mission" },
            { label: "Facilities", href: "/facilities" },
        ],
    },
    {
        label: "Academics",
        href: "/academics/classes",
        children: [
            { label: "Our Classes", href: "/academics/classes" },
            { label: "Curriculum & Approach", href: "/academics/curriculum" },
            { label: "Activities", href: "/academics/activities" },
            { label: "Fees Structure", href: "/academics/fees" },
            { label: "Teachers & Staff", href: "/teachers" },
        ],
    },
    {
        label: "Admission",
        href: "/admission/information",
        children: [
            { label: "Admission Information", href: "/admission/information" },
            { label: "Admission Notices", href: "/admission/notices" },
        ],
    },
    { label: "Student Corner", href: "/student-corner" },
    {
        label: "Updates",
        href: "/notices",
        children: [
            { label: "Notice Board", href: "/notices" },
            { label: "News & Events", href: "/news" },
        ],
    },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
];

/** Quick actions shown as buttons in the header and mobile menu. */
export const quickLinks = [
    { label: "Online Result", href: "/result" },
    { label: "Portal Login", href: "/login" },
];
