import { img } from "./media";

/**
 * Phase 1 static news & events, built from real school photos.
 * TODO(school): confirm event names and dates (dates below are approximate).
 * @type {import("@/lib/data/types").NewsPost[]}
 */
export const news = [
    {
        id: "e-art-2026",
        slug: "kpr-international-art-exhibition-2026",
        title: "Prizes and smiles at the KPR International Art Exhibition 2026",
        excerpt: "Greendale's young artists took the stage at Shilpakala Academy and came home with prizes and certificates.",
        publishedAt: "2026-09-04T12:00:00+06:00",
        cover: img.artWinners,
        images: [img.artStage, img.artPrize, img.artWinners],
        albumSlug: "art-exhibition-2026",
        bodyHtml: `
<p>Greendale students took part in the <strong>KPR International Art Virtual Art Exhibition and Prize Giving Ceremony 2026</strong>, held at Shilpakala Academy, Dhaka.</p>
<p>Our young artists walked onto the stage in their green and cream uniforms to receive prizes and certificates in front of guests and parents. For many of them it was the first time on such a big stage, and they handled it beautifully.</p>
<p>Thank you to the art teachers who guided them, and to the parents who cheered from the audience.</p>`,
    },
    {
        id: "e-teachers-day",
        slug: "celebrating-our-teachers",
        title: "Celebrating our teachers",
        excerpt: "Students and guardians came together to say thank you to the teachers who make Greendale a second home.",
        publishedAt: "2026-10-05T12:00:00+06:00",
        cover: img.classGroup,
        bodyHtml: `
<p>On Teachers' Day, students and guardians came together to thank the teachers of Greendale with cards, flowers and a small celebration on campus. Watch the video in our gallery.</p>`,
    },
    {
        id: "e-projects",
        slug: "little-builders-class-projects",
        title: "Little builders: class project day",
        excerpt: "Students designed, built and presented their own colourful models to classmates and teachers.",
        publishedAt: "2026-08-20T12:00:00+06:00",
        cover: img.scienceProject,
        bodyHtml: `
<p>Project day turned the classroom into a workshop. In small teams, students designed and built their own models using cardboard, paper and paint, then explained their work to classmates and teachers in English.</p>
<p>Projects like this help children plan, work together and speak with confidence.</p>`,
    },
    {
        id: "e-birthdays",
        slug: "birthdays-in-class",
        title: "Birthdays are a class celebration",
        excerpt: "Crowns, candles and a lot of singing: every birthday at Greendale is celebrated together.",
        publishedAt: "2026-07-15T12:00:00+06:00",
        cover: img.birthdayCake,
        bodyHtml: `<p>At Greendale, birthdays are celebrated with the whole class. Paper crowns, a cake on the desk and a loud "Happy Birthday" chorus make every child feel special on their day.</p>`,
    },
];
