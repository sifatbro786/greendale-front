import { img } from "./media";

/**
 * Teachers & staff. Phase 2: Staff where showOnWebsite = true, ordered.
 * TODO(school): teacher list with name, designation, qualification and photo.
 * Left empty on purpose: the site shows a friendly empty state instead of invented people.
 * @type {import("@/lib/data/types").Staff[]}
 */
export const staff = [];

/**
 * Facilities. Only items the school confirmed (see project brief) plus what the photos show.
 * @type {import("@/lib/data/types").Facility[]}
 */
export const facilities = [
    {
        id: "f-ac",
        title: "AC classrooms",
        text: "Every classroom is air-conditioned, so children stay fresh and focused through Dhaka's hottest months.",
        image: img.classroomSmiles,
        tone: "sky",
    },
    {
        id: "f-play",
        title: "Kids' play zone",
        text: "A bright indoor play area with slides and play equipment, where little ones burn energy between lessons.",
        image: img.playZone,
        tone: "coral",
    },
    {
        id: "f-walls",
        title: "Colourful learning walls",
        text: "Alphabet charts, artwork and class projects cover the walls, so every corner teaches something.",
        image: img.classroomWalls,
        tone: "sun",
    },
    {
        id: "f-arabic",
        title: "Free Arabic learning",
        text: "Arabic reading lessons are included free of charge for every student.",
        image: img.classGroup,
        tone: "brand",
    },
    {
        id: "f-events",
        title: "Space for celebrations",
        text: "Cultural programmes, birthdays and prize days are held right on campus with families invited.",
        image: img.cultural,
        tone: "coral",
    },
];

/**
 * Student corner downloads (routines, syllabus, exam schedules). Phase 2: published files from the admin panel.
 * TODO(school): class routines, syllabus PDFs and exam schedule.
 * @type {import("@/lib/data/types").Download[]}
 */
export const downloads = [];
