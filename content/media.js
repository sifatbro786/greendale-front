/**
 * Phase 1 media library (files in /public/images and /public/videos).
 * In Phase 2 these move to /var/www/greendale/uploads/public and the API returns the same ImageRef shape.
 * @type {Record<string, import("@/lib/data/types").ImageRef>}
 */
export const img = {
    cover: { src: "/images/cover-illustration.jpg", width: 2400, height: 1560, alt: "Greendale English Version School illustration with children reading under a tree" },
    dressCode: { src: "/images/dress-code.jpg", width: 1080, height: 1350, alt: "Greendale school uniform: cream shirt with green collar and dark green skirt" },
    classGroup: { src: "/images/class-group-teachers.jpg", width: 2400, height: 1109, alt: "Greendale students with their teachers in a classroom" },
    classroomSmiles: { src: "/images/classroom-smiles.jpg", width: 2400, height: 1109, alt: "Smiling students sitting at green desks with their teacher" },
    drawingClass: { src: "/images/drawing-class.jpg", width: 2400, height: 1800, alt: "Students holding up their lotus drawings in class" },
    scienceProject: { src: "/images/science-project.jpg", width: 2400, height: 1871, alt: "Students presenting a colourful model project" },
    birthday: { src: "/images/birthday-celebration.jpg", width: 2400, height: 2040, alt: "Students and teachers celebrating a birthday in class" },
    birthdayCake: { src: "/images/birthday-cake.jpg", width: 2400, height: 1800, alt: "Children gathered around a birthday cake in the classroom" },
    eventHall: { src: "/images/event-day-hall.jpg", width: 2016, height: 1512, alt: "Students lined up in the decorated hall on an event day" },
    cultural: { src: "/images/cultural-program.jpg", width: 1624, height: 1080, alt: "Children in costumes at a cultural programme" },
    artStage: { src: "/images/art-exhibition-stage.jpg", width: 2400, height: 1807, alt: "Greendale students on stage at the KPR International Art exhibition" },
    artPrize: { src: "/images/art-exhibition-prize.jpg", width: 2400, height: 1351, alt: "Students receiving prizes at the art exhibition ceremony" },
    artWinners: { src: "/images/art-exhibition-winners.jpg", width: 2400, height: 1351, alt: "Young artists holding their certificates and prizes" },
    playZone: { src: "/images/play-zone.jpg", width: 2160, height: 1216, alt: "Children dancing in the kids' play zone with slides behind them" },
    classroomWalls: { src: "/images/classroom-walls.jpg", width: 1440, height: 808, alt: "Classroom with number charts and cartoon learning walls" },
    wsIsAmAre: { src: "/images/worksheet-is-am-are.jpg", width: 1024, height: 1536, alt: "Grade 1 English worksheet on is, am and are" },
    wsVerbs: { src: "/images/worksheet-action-verbs.jpg", width: 1024, height: 1536, alt: "Grade 1 English worksheet on action verbs" },
    wsPhonics: { src: "/images/worksheet-phonics.jpg", width: 1024, height: 1536, alt: "Phonics sentences worksheet with short vowels, digraphs, sight words and blends" },
};

export const video = {
    hero: { src: "/videos/hero-v2.mp4", poster: "/videos/hero-poster.jpg" },
    dance: { src: "/videos/dance.mp4", poster: "/videos/dance-poster.jpg" },
    teachersDay: { src: "/videos/teachers-day.mp4", poster: "/videos/teachers-day-poster.jpg" },
    classroom: { src: "/videos/classroom.mp4", poster: "/videos/classroom-poster.jpg" },
    overview: { src: "/videos/overview.mp4", poster: "/videos/overview-poster.jpg" },
};
