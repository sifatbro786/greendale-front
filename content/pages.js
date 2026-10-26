import { img } from "./media";

/**
 * Phase 1 static pages. Phase 2: Page model (slug unique per section), edited in /admin with a limited rich-text toolbar.
 * Copy marked DRAFT was written by STR from the information the school shared and must be approved by the school.
 * @type {import("@/lib/data/types").Page[]}
 */
export const pages = [
    /* ------------------------------ ABOUT ------------------------------ */
    {
        section: "about",
        slug: "introduction",
        title: "Introduction",
        summary: "An English Version school in Mirpur, Dhaka for children from Play Group to Class V.",
        cover: img.classGroup,
        updatedAt: "2026-10-26",
        bodyHtml: `
<p><strong>Greendale English Version School</strong> provides quality education in English Version from Play Group to Class V. We are a young school in 1st Colony, Mirpur, built around one simple idea: little children learn best when they feel happy, safe and heard.</p>
<p>Lessons are taught in English from the very first day, so children grow up reading, writing and speaking it naturally. Alongside the national curriculum we put special emphasis on <strong>handwriting, spoken English and phonics</strong>, the three skills that shape everything a child learns later.</p>
<h3>What every Greendale child gets</h3>
<ul>
<li>English Version teaching from Play Group to Class V</li>
<li>Air-conditioned classrooms</li>
<li>A kids' play zone inside the campus</li>
<li>Free Arabic learning</li>
<li>Highly qualified and experienced teachers</li>
<li>Special focus on handwriting, spoken English and phonics</li>
</ul>
<p>Our EIIN is <strong>484897</strong>.</p>`,
    },
    {
        section: "about",
        slug: "our-story",
        title: "Our Story",
        summary: "Established in 2024, Greendale opened its doors to its first students in January 2025.",
        cover: img.birthday,
        updatedAt: "2026-10-26",
        // DRAFT: expand with the founding story from the Chairman.
        bodyHtml: `
<p>Greendale English Version School was established in 2024 under the guidance of our Director &amp; Chairman, <strong>Hafiz Uddin</strong>, known to students and parents as <strong>Aynal Sir</strong>. The first academic session began on 1 January 2025.</p>
<p>From the first day the school has been run like a big family. Birthdays are celebrated in class, every child's drawing goes up on the wall, and parents are welcome to talk with teachers about their child's progress.</p>
<p>In a short time our students have already stood on bigger stages, including the <strong>KPR International Art Exhibition and Prize Giving Ceremony 2026</strong> at Shilpakala Academy, where Greendale children received prizes and certificates for their artwork.</p>
<p>We are still growing, and every new family becomes part of the story.</p>`,
    },
    {
        section: "about",
        slug: "chairman-message",
        title: "Message from the Chairman",
        summary: "Hafiz Uddin (Aynal Sir), Director & Chairman, on why Greendale was founded and what it stands for.",
        updatedAt: "2026-10-26",
        // The Chairman's talk is the message for now. TODO(school): written message + portrait photo.
        bodyHtml: `
<p>Our Director &amp; Chairman, <strong>Hafiz Uddin</strong> (Aynal Sir), shares in his own words why Greendale was started, how the school teaches its youngest learners, and what parents can expect from us. Watch the talk above.</p>
<p>A written message from the Chairman will be published here soon.</p>`,
    },
    {
        section: "about",
        slug: "vision-mission",
        title: "Vision & Mission",
        summary: "Confident, kind and curious children who can express themselves clearly in English.",
        cover: img.drawingClass,
        updatedAt: "2026-10-26",
        // DRAFT: wording to be approved by the school.
        bodyHtml: `
<h3>Our vision</h3>
<p>To raise confident, kind and curious children who read with joy, write with care and speak their mind clearly in English, while staying rooted in their own language, culture and values.</p>
<h3>Our mission</h3>
<ul>
<li>Teach every subject in English Version from Play Group, so English becomes natural, not a struggle.</li>
<li>Build strong foundations in phonics, handwriting and spoken English in the early years.</li>
<li>Offer free Arabic learning so children can read with understanding.</li>
<li>Keep classrooms comfortable, colourful and safe, with space to play.</li>
<li>Work closely with parents, so home and school pull in the same direction.</li>
</ul>`,
    },

    /* ---------------------------- ACADEMICS ---------------------------- */
    {
        section: "academics",
        slug: "classes",
        title: "Our Classes",
        summary: "Eight classes, two stages: Early Years (Play Group to KG) and Primary (Class I to V).",
        cover: img.classroomSmiles,
        updatedAt: "2026-10-26",
        bodyHtml: `<p>Every class is taught in English Version. In the Early Years children learn through songs, stories, play and hands-on activities. From Class I they move to structured subjects, regular class tests and term examinations.</p>`,
    },
    {
        section: "academics",
        slug: "curriculum",
        title: "Curriculum & Approach",
        summary: "The national curriculum in English Version, plus daily phonics, handwriting and spoken English.",
        cover: img.wsPhonics,
        updatedAt: "2026-10-26",
        // DRAFT: confirm textbook board / publisher list with the school.
        bodyHtml: `
<p>Greendale follows the national curriculum in English Version. On top of it we add three daily habits that make a lasting difference for young children.</p>
<h3>Phonics</h3>
<p>Children learn the sounds letters make before they learn their names. Short vowels, digraphs, blends and sight words come step by step, so reading feels like decoding a puzzle, not memorising a page.</p>
<h3>Handwriting</h3>
<p>Correct pencil grip, letter formation and spacing are practised every day. Neat handwriting is a special emphasis at Greendale, from tracing in Nursery to joined writing in the upper classes.</p>
<h3>Spoken English</h3>
<p>Children are encouraged to answer, ask and share in English from day one: greetings, show-and-tell, rhymes and short presentations.</p>
<h3>Free Arabic learning</h3>
<p>Arabic reading is taught free of charge, so children can recite with correct pronunciation.</p>
<h3>Worksheets and practice</h3>
<p>Teachers prepare colourful worksheets for grammar, vocabulary and phonics so children practise what they learn in class. You can see a few of them below.</p>`,
    },
    {
        section: "academics",
        slug: "activities",
        title: "Activities",
        summary: "Art, celebrations, cultural programmes and projects: learning does not stop at the textbook.",
        cover: img.artWinners,
        updatedAt: "2026-10-26",
        bodyHtml: `
<p>Children remember what they make, perform and celebrate. That is why the Greendale calendar is full of activities.</p>
<ul>
<li><strong>Art and drawing</strong>: regular drawing classes, and students have taken part in the KPR International Art Exhibition 2026.</li>
<li><strong>Projects and models</strong>: class projects where children build and present their own models.</li>
<li><strong>Cultural programmes</strong>: dance, songs and costume shows on national days and school events.</li>
<li><strong>Celebrations</strong>: birthdays in class, Teachers' Day and other special days.</li>
<li><strong>Kids' play zone</strong>: indoor play time that keeps little bodies active.</li>
</ul>`,
    },
    {
        section: "academics",
        slug: "fees",
        title: "Fees Structure",
        summary: "Admission, session and monthly tuition fees for each class.",
        updatedAt: "2026-10-26",
        // Phase 2: rendered from FeeStructure where public = true. TODO(school): fee heads and amounts per class.
        bodyHtml: `<p>The fee chart for the current session will be published here. For admission and monthly tuition fees, please call or WhatsApp the school office and we will be happy to explain everything.</p>`,
    },

    /* ---------------------------- ADMISSION ---------------------------- */
    {
        section: "admission",
        slug: "information",
        title: "Admission Information",
        summary: "Admission is open from Play Group to Class V. Here is how to join Greendale.",
        cover: img.cover,
        updatedAt: "2026-10-26",
        // DRAFT: confirm required documents and steps with the office.
        bodyHtml: `
<p>We welcome new families throughout the year, subject to seat availability. Visit the campus, meet the teachers and see the classrooms for yourself.</p>`,
    },

    /* ------------------------------ LEGAL ------------------------------ */
    // DRAFT: written by STR to match how this website actually works. Must be approved by the school before launch.
    // Update when Phase 3 (portal, online payment) goes live. This is not legal advice.
    {
        section: "legal",
        slug: "privacy",
        title: "Privacy Policy",
        summary: "What information this website collects, why, and how the school protects it.",
        updatedAt: "2026-10-26",
        bodyHtml: `
<p>Greendale English Version School ("the school", "we") runs this website for parents, students and visitors. We care deeply about the privacy of children and their families. This policy explains what information the website collects and how it is used.</p>

<h3>1. Information we collect</h3>
<ul>
<li><strong>Contact form:</strong> when you send a message we receive your name, mobile number, your email address (if you give it) and your message.</li>
<li><strong>Technical information:</strong> like every website, our server receives your IP address and basic browser information. We use the IP address only to block spam and abuse of our forms.</li>
<li><strong>Portal (when it opens):</strong> the student and guardian portal will show the school's own records about your child, such as class, results, attendance and fees. Login details are created and given by the school office.</li>
</ul>
<p>We do not ask for any information about children through this website, and we do not sell, rent or trade personal information.</p>

<h3>2. How we use information</h3>
<ul>
<li>To reply to your message, admission question or request.</li>
<li>To share school notices, results and fee information with the right guardian.</li>
<li>To keep the website and its forms secure.</li>
</ul>

<h3>3. Cookies</h3>
<p>The public website does not use advertising or tracking cookies. When the portal opens, it will use secure login cookies that are needed to keep you signed in. They are not used for advertising.</p>

<h3>4. Photos and videos of students</h3>
<p>Photos and videos on this website show school activities and are published by the school. If you are a guardian and would like a photo or video of your child removed, contact the office and we will remove it as soon as possible.</p>

<h3>5. Third-party services</h3>
<ul>
<li><strong>YouTube:</strong> videos are embedded in privacy-enhanced mode and only load when you press play. YouTube's own privacy policy then applies.</li>
<li><strong>Google Maps:</strong> the map on the contact page is provided by Google.</li>
<li><strong>Email and SMS:</strong> messages are sent through email and SMS service providers chosen by the school.</li>
<li><strong>Online payment (when available):</strong> card and mobile banking payments are handled by the payment gateway. The school does not see or store your card or wallet details.</li>
</ul>

<h3>6. How we protect information</h3>
<p>The website runs over a secure HTTPS connection. Access to student records is limited by role, so teachers, office staff and guardians only see what they need. Guardians can only see their own child's information.</p>

<h3>7. How long we keep information</h3>
<p>Messages from the contact form are kept only as long as needed to answer them. Student records are kept by the school as part of its normal academic records.</p>

<h3>8. Your choices</h3>
<p>You can ask the school to show, correct or delete the personal information you have given us through this website. Please contact the office using the details below.</p>

<h3>9. Changes to this policy</h3>
<p>We may update this policy when the website changes. The date at the top of this page shows the latest version.</p>

<h3>10. Contact</h3>
<p>Greendale English Version School, Commerce Coaching Home, 27 C/A, 1st Colony, Mirpur, Dhaka 1216. Phone / WhatsApp: <strong>+880 1720-836744</strong>.</p>`,
    },
    {
        section: "legal",
        slug: "terms",
        title: "Terms of Use",
        summary: "The simple rules for using the Greendale website, portal and online services.",
        updatedAt: "2026-10-26",
        bodyHtml: `
<p>By using this website you agree to these terms. If you do not agree, please do not use the website.</p>

<h3>1. About this website</h3>
<p>This website is run by Greendale English Version School, Mirpur, Dhaka, to share information about the school with parents, students and visitors.</p>

<h3>2. Accuracy of information</h3>
<p>We try to keep all information correct and up to date. Notices, fees, dates and results on the website are for information. If anything on the website is different from a notice or document issued by the school office, the office copy is final.</p>

<h3>3. Photos, logo and content</h3>
<p>The school name, logo, photos, videos, worksheets and text on this website belong to the school. Please do not copy, edit or reuse them, and never reuse photos or videos of children, without written permission from the school.</p>

<h3>4. Acceptable use</h3>
<ul>
<li>Do not try to access information that does not belong to you, including another student's records.</li>
<li>Do not send spam, false information or harmful content through our forms.</li>
<li>Do not try to break, overload or disrupt the website.</li>
</ul>

<h3>5. Portal accounts (when available)</h3>
<ul>
<li>Login details are given by the school office and are for the student and their guardian only.</li>
<li>Keep your password secret. You are responsible for activity on your account.</li>
<li>If you think someone else knows your password, contact the office so it can be reset.</li>
<li>The school may suspend an account that is misused.</li>
</ul>

<h3>6. Online results</h3>
<p>Results shown online are for quick reference. The signed marksheet issued by the school is the official record.</p>

<h3>7. Online payments (when available)</h3>
<p>A payment is complete only when the school receives confirmation from the payment gateway. A receipt is issued for every confirmed payment. For any payment problem, contact the office with your transaction ID. Gateway charges, if any, are set by the payment provider.</p>

<h3>8. Links to other websites</h3>
<p>The website may link to other sites such as YouTube, Facebook and Google Maps. The school is not responsible for the content or policies of those sites.</p>

<h3>9. Limitation of liability</h3>
<p>The school is not responsible for any loss caused by temporary unavailability of the website or by technical errors, though we will fix problems as quickly as we can.</p>

<h3>10. Governing law</h3>
<p>These terms are governed by the laws of Bangladesh.</p>

<h3>11. Changes and contact</h3>
<p>We may update these terms from time to time. For any question, call or WhatsApp <strong>+880 1720-836744</strong> or visit the school office.</p>`,
    },
];

/**
 * Admission steps and documents. TODO(school): confirm. Phase 2: part of the admission Page model.
 */
export const admissionSteps = [
    { title: "Call or visit", text: "Call or WhatsApp the office, or walk in to the campus in 1st Colony, Mirpur." },
    { title: "Collect the form", text: "Collect the admission form from the office and see the classrooms." },
    { title: "Short meeting", text: "A friendly meeting with your child to find the right class." },
    { title: "Confirm admission", text: "Submit the form with documents and pay the admission fee." },
];

export const admissionDocuments = [
    "Birth registration certificate (copy)",
    "Two passport-size photos of the student",
    "Photos and NID copies of the parents",
    "Previous school report or transfer certificate (Class I and above)",
];
