/**
 * Shared data shapes for the public site.
 * Phase 1: returned from /content/*.js. Phase 2: returned by the Express API
 * (/api/public/*) in exactly the same shape — pages never notice the switch.
 * The API validates these shapes with zod.
 */

/**
 * @typedef {Object} ImageRef
 * @property {string} src     Path under /public (Phase 1) or /uploads/public/... (Phase 2)
 * @property {string} alt
 * @property {number} [width]
 * @property {number} [height]
 */

/**
 * @typedef {Object} Page
 * @property {"about"|"academics"|"admission"|"legal"} section
 * @property {string} slug
 * @property {string} title
 * @property {string} summary        One or two lines for the page header and meta description
 * @property {ImageRef} [cover]
 * @property {string} bodyHtml       Sanitised HTML (server-side sanitize-html allowlist in Phase 2)
 * @property {string} updatedAt      ISO date
 */

/**
 * @typedef {Object} SchoolClass
 * @property {string} id
 * @property {string} slug
 * @property {string} name           e.g. "Play Group", "Class III"
 * @property {"early"|"primary"} stage
 * @property {number} order
 * @property {"MARKS"|"REMARKS"} gradingMode
 * @property {string} ageHint        Shown as guidance only
 * @property {"coral"|"sun"|"sky"|"brand"} tone
 * @property {string} summary
 * @property {string[]} focus
 */

/**
 * @typedef {Object} Notice
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {"general"|"admission"|"exam"|"holiday"|"event"} category
 * @property {string} publishedAt    ISO date-time; a future date = scheduled (hidden)
 * @property {boolean} pinned
 * @property {string} [excerpt]
 * @property {string} [bodyHtml]
 * @property {string} [pdfUrl]
 */

/**
 * @typedef {Object} NewsPost
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} excerpt
 * @property {string} bodyHtml
 * @property {string} publishedAt
 * @property {ImageRef} cover
 * @property {ImageRef[]} [images]
 * @property {string} [albumSlug]
 */

/**
 * @typedef {Object} GalleryAlbum
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} [description]
 * @property {string} [date]
 * @property {ImageRef} cover
 * @property {ImageRef[]} images
 */

/**
 * @typedef {Object} VideoItem
 * @property {string} id
 * @property {string} title
 * @property {"file"|"youtube"} kind
 * @property {string} [src]          for kind "file"
 * @property {string} [poster]
 * @property {string} [youtubeId]    for kind "youtube"
 * @property {"landscape"|"portrait"} orientation
 */

/**
 * @typedef {Object} Staff
 * @property {string} id
 * @property {string} name
 * @property {string} designation
 * @property {string} [qualification]
 * @property {string} [photo]
 * @property {"teacher"|"office"} group
 * @property {number} order
 */

/**
 * @typedef {Object} Facility
 * @property {string} id
 * @property {string} title
 * @property {string} text
 * @property {ImageRef} image
 * @property {"coral"|"sun"|"sky"|"brand"} tone
 */

/**
 * @typedef {Object} Download
 * @property {string} id
 * @property {string} title
 * @property {"routine"|"syllabus"|"exam-schedule"|"form"} kind
 * @property {string} [className]
 * @property {string} url
 * @property {string} publishedAt
 */

export {};
