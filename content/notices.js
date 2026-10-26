/**
 * Phase 1 static notices. Phase 2: Notice model (category, pinned, PDF, scheduled publishedAt).
 * SAMPLE: these three are placeholders for the demo. Replace with real notices from the office before launch.
 * @type {import("@/lib/data/types").Notice[]}
 */
export const notices = [
    {
        id: "n-2026-admission",
        slug: "admission-going-on-play-group-to-class-v",
        title: "Admission going on: Play Group to Class V",
        category: "admission",
        publishedAt: "2026-10-20T09:00:00+06:00",
        pinned: true,
        excerpt: "Limited seats available. Call or WhatsApp +880 1720-836744 or visit the campus.",
        bodyHtml:
            "<p>Admission is going on for Play Group to Class V. Seats are limited in every class.</p><p>Guardians can collect the admission form from the school office or call / WhatsApp <strong>+880 1720-836744</strong> for details.</p>",
    },
    {
        id: "n-2026-dress-code",
        slug: "school-dress-code-reminder",
        title: "Reminder: full school uniform every day",
        category: "general",
        publishedAt: "2026-10-12T09:00:00+06:00",
        pinned: false,
        excerpt: "Students must come in the full Greendale uniform with ID card.",
        bodyHtml:
            "<p>Dear guardians, please make sure your child comes to school in the full Greendale uniform with the school ID card every day. Contact the office for uniform details.</p>",
    },
    {
        id: "n-2026-art",
        slug: "congratulations-young-artists-kpr-2026",
        title: "Congratulations to our young artists",
        category: "event",
        publishedAt: "2026-09-05T09:00:00+06:00",
        pinned: false,
        excerpt: "Greendale students received prizes at the KPR International Art Exhibition 2026.",
        bodyHtml:
            "<p>We are proud of our students who took part in the KPR International Art Exhibition and Prize Giving Ceremony 2026 at Shilpakala Academy. Congratulations to every young artist!</p>",
    },
];

export const noticeCategories = [
    { value: "all", label: "All" },
    { value: "admission", label: "Admission" },
    { value: "exam", label: "Exam" },
    { value: "holiday", label: "Holiday" },
    { value: "event", label: "Event" },
    { value: "general", label: "General" },
];
