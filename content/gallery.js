import { img, video } from "./media";

/**
 * Phase 1 static gallery. Phase 2: GalleryAlbum + GalleryImage (uploads), YouTube embeds.
 * @type {import("@/lib/data/types").GalleryAlbum[]}
 */
export const albums = [
    {
        id: "a-art-2026",
        slug: "art-exhibition-2026",
        title: "KPR International Art Exhibition 2026",
        description: "Our students at Shilpakala Academy.",
        date: "2026-09-04",
        cover: img.artStage,
        images: [img.artStage, img.artPrize, img.artWinners],
    },
    {
        id: "a-classroom",
        slug: "classroom-life",
        title: "Classroom life",
        description: "Drawing, projects and everyday smiles.",
        date: "2026-08-25",
        cover: img.drawingClass,
        images: [img.drawingClass, img.scienceProject, img.classroomSmiles, img.classGroup],
    },
    {
        id: "a-celebrations",
        slug: "celebrations",
        title: "Celebrations & programmes",
        description: "Birthdays, cultural programmes and event days.",
        date: "2026-07-15",
        cover: img.birthday,
        images: [img.birthday, img.birthdayCake, img.cultural, img.eventHall],
    },
    {
        id: "a-learning",
        slug: "learning-materials",
        title: "What we learn",
        description: "Worksheets our teachers prepare for grammar and phonics.",
        date: "2026-08-01",
        cover: img.wsPhonics,
        images: [img.wsPhonics, img.wsIsAmAre, img.wsVerbs],
    },
];

/** @type {import("@/lib/data/types").VideoItem[]} */
export const videos = [
    { id: "v-dance", title: "Little dancers on stage", kind: "file", ...video.dance, orientation: "landscape" },
    { id: "v-teachers-day", title: "Celebrating our teachers", kind: "file", ...video.teachersDay, orientation: "landscape" },
    { id: "v-classroom", title: "A day of drawing in class", kind: "file", ...video.classroom, orientation: "portrait" },
    { id: "v-overview", title: "Around the campus", kind: "file", ...video.overview, orientation: "portrait" },
    { id: "v-yt-chairman", title: "Director & Chairman's talk", kind: "youtube", youtubeId: "rbTnYXz3gs8", orientation: "landscape" },
    { id: "v-yt-guardian", title: "For every student & guardian", kind: "youtube", youtubeId: "NKXTekrA2QM", orientation: "landscape" },
];
