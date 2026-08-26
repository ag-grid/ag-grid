// Shared content for the Beyond the Prompt page, its markdown twin and its
// /session/<slug> recording pages. Kept here (rather than inline in the page) so
// the dynamic route can build a real, crawlable page per recorded session and the
// markdown twin renders the same prose as the page.

// Prose the page and its markdown twin both render.
export const PAGE_CONTENT = {
    intro: {
        heading: 'Getting to a prototype with AI is easy. Production is not.',
        body: [
            'Beyond the Prompt is a series of events exploring the tension between how easy it is to prototype with AI and how hard it is to make that work hold up in production. Performance degrades, edge cases multiply, and the application you built is not the one you need. That is the point where AI helps less, and where the real engineering begins.',
            'London was the first stop. The day brought together engineers and experts to talk honestly about what it takes to build applications that hold up in production, with time to connect with our teams over lunch, coffee, and drinks. The series continues later this year in New York.',
        ],
    },
    programme: {
        location: 'London, May 2026',
        speakersLead:
            'Engineers and experts from AG Grid, Bryntum, and beyond who spoke about what it takes to build applications that hold up in production.',
    },
    notify: {
        location: 'New York',
        heading: 'Get notified',
        lead: "The series continues in New York. Leave your email and we'll let you know as soon as registration opens.",
    },
};

export type SessionSpeaker = {
    name: string;
    role: string;
};

export type Session = {
    title: string;
    speakers?: SessionSpeaker[];
    description?: string;
    // YouTube watch URL for the recorded session. Sessions with one become a
    // link to /session/<slug>, which opens the recording in a modal on the main
    // page and is a real page when visited directly.
    youtubeUrl?: string;
};

// Single-track running order, talks only. Breaks, registration, the welcome and
// the closing remarks are intentionally omitted now the event has run.
export const SESSIONS: Session[] = [
    {
        title: 'Opening Keynote',
        speakers: [
            { name: 'John Masterson', role: 'CEO, AG Grid' },
            { name: 'Mats Bryntse', role: 'Founder & CEO, Bryntum' },
        ],
        youtubeUrl: 'https://youtu.be/XY30-iUTB3E',
    },
    {
        title: 'Goodbye slop; welcome determinism',
        speakers: [{ name: 'David Khourshid', role: 'Founder, Stately.ai' }],
        description:
            'Vibe coding feels productive until you have to maintain it. Come for the critique of the nondeterministic status quo, leave with a framework for using AI to build software you actually understand.',
        youtubeUrl: 'https://youtu.be/uMvTAF280so',
    },
    {
        title: 'Codebase design for the agent era',
        speakers: [{ name: 'Stephen Cooper', role: 'Team Lead, AG Grid' }],
        description:
            "As AI agents become part of the development workflow, codebase structure and well-designed system prompts matter more than ever. This session showed how we're approaching this in the AG Grid and AG Charts codebases..",
        youtubeUrl: 'https://youtu.be/q61M5ch5dVs',
    },
    {
        title: 'AI in AG Studio',
        speakers: [{ name: 'Josh Hobson', role: 'Developer, AG Grid' }],
        description:
            "How do you build a dashboard you can't see? A behind-the-scenes look at AG Studio's multi-agent architecture and the client-side tools that let any LLM build reports it otherwise couldn't.",
        youtubeUrl: 'https://youtu.be/erP7U61RqL0',
    },
    {
        title: 'Bringing AI to the Canvas',
        speakers: [{ name: 'Steve Ruiz', role: 'CEO, tldraw' }],
        description: `At tldraw, we've been bringing agents to our infinite canvas. In December 2025, we ran a one-month experiment named Fairydraw where users could work with three fairies - virtual collaborators who work with you, with your human collaborators, and coordinate together on large tasks.`,
        youtubeUrl: 'https://youtu.be/TDvXe6XHU3c',
    },
    {
        title: 'Debugging CSS performance with AI',
        speakers: [{ name: 'Bernie Sumption', role: 'Developer, AG Grid' }],
        description:
            'CSS performance issues can be subtle and time-consuming. This talk showed how you can guide AI to uncover bugs without needing to learn the intricacies of CSS rendering internals.',
        youtubeUrl: 'https://youtu.be/GCJv3w5CDbI',
    },
    {
        title: 'Software that moves fleets: Lessons from AG Grid, Bryntum, and Beyond',
        speakers: [{ name: 'Patrick Rau', role: 'Developer, TCS' }],
        description:
            "In aviation, the software has to be rock solid. Patrick pulled back the curtain on the components powering Fleetplan's UI, including AG Grid, Bryntum's Scheduler Pro, and the modules behind audit tracking and safety reporting that keep operations airtight.",
        youtubeUrl: 'https://youtu.be/mB4odIH_V1w',
    },
    {
        title: 'Product Roadmap',
        speakers: [
            { name: 'Johan Isaksson', role: 'Head of Engineering, Bryntum' },
            { name: 'Adam Wang', role: 'AG Studio Product Lead, AG Grid' },
        ],
        description: "A detailed look at our roadmap, covering AG Grid and Bryntum's suite of tools.",
        youtubeUrl: 'https://youtu.be/C_Ii7v4AWvw',
    },
    {
        title: 'One-click agentic SDLC',
        speakers: [{ name: 'Mats Bryntse', role: 'Founder & CEO, Bryntum' }],
        description:
            'A demo of a headless Claude workflow, built by Bryntum CEO Mats, that turns GitHub issues into mergeable PRs, with agents doing the work, and a custom Kanban UI keeping things in check.',
        youtubeUrl: 'https://youtu.be/gTjoAERDB5M',
    },
    {
        title: 'How agentic AI Is reshaping software engineering',
        speakers: [
            { name: 'Maggie Appleton', role: 'Staff Research Engineer, GitHub' },
            { name: 'Matt Pocock', role: 'Senior Developer Educator, AI Hero' },
            { name: 'Sophie Koonin', role: 'Web Discipline Lead, Monzo' },
        ],
        description:
            'As AI reshapes how software gets built, what actually changes for engineers, teams, and developer tools? This panel explored the real-world impact of agentic workflows on software engineering - from code review and system design to cognitive skills, ownership, and developer experience. Practical insights, rapid-fire hot takes, and honest discussion from engineers building beyond the prompt.',
        youtubeUrl: 'https://youtu.be/q5H2Lcjo29E',
    },
    {
        title: 'Vibe Coding as a Maker',
        speakers: [{ name: 'Matt Webb', role: 'Co-founder, Inanimate' }],
        description:
            'Matt showed his vibe coding experiments, from his AI clock to an app that points to the centre of the galaxy, and shared some learnings from building hardware at his startup, Inanimate. Then we asked: what are the limits of vibing and agentic coding? And how might we create libraries that agents love?',
        youtubeUrl: 'https://youtu.be/mcHscAcv288',
    },
];

export type Speaker = {
    name: string;
    title: string;
    bio: string;
    image: string;
    // Re-shaded variant designed for orange backgrounds. The ditherpattern
    // and knockout values are tuned for #F43800; we crossfade to it on
    // card hover (Speakers grid) and use it directly in the agenda hover
    // overlay, where the row turns orange behind the portrait.
    imageOrange?: string;
    // Some speaker SVGs are exported as full-figure portraits with very tall,
    // narrow aspect ratios (e.g. Mats 193×352, John 232×388). Using the
    // default `object-fit: cover` on a 4:5 box clips ~140px off the bottom.
    // Setting `imageFit: 'contain'` switches just those cards to fit-the-whole
    // SVG while staying anchored to the bottom of the frame.
    imageFit?: 'contain';
};

export const SPEAKERS: Speaker[] = [
    {
        name: 'Matt Webb',
        title: 'Co-founder, Inanimate',
        bio: "Matt is co-founder of Inanimate, consumer hardware bringing agents into the real world. Previously he has consulted with Google's AI research group, run startup accelerators with R/GA Ventures, and was CEO and co-founder of the design studio BERG which invented some of the world’s first internet-connected consumer products like Little Printer (and has work in the New York MoMA). He is co-author of Mind Hacks (O’Reilly, 2004). Since 2000 Matt has blogged at interconnected.org. He writes weekly+ on computing, design, and speculative futures. He lives in London.",
        image: 'images/campaigns/beyond-the-prompt/svg/mat-web.svg',
        imageOrange: 'images/campaigns/beyond-the-prompt/svg/mat-web-orange-bg.svg',
    },
    {
        name: 'Stephen Cooper',
        title: 'Team Lead, AG Grid',
        bio: `Stephen is the Team Lead for AG Grid and loves sharing practical, experience-based tips, tricks, and case studies from years in the codebase. He's gone deep into grid performance and framework integrations, and has spent more time than he'd like profiling render cycles. Outside of work, life revolves around family, four kids and two dogs, and he's happiest when the whole crew is out together exploring in the park.`,
        image: 'images/campaigns/beyond-the-prompt/svg/stephen.svg',
        imageOrange: 'images/campaigns/beyond-the-prompt/svg/stephen-orange-bg.svg',
    },
    {
        name: 'Maggie Appleton',
        title: 'Staff Research Engineer, GitHub',
        bio: `Maggie is a Staff Research Engineer at GitHub, where she works on tools for thinking, writing, and building with code. With a background in anthropology, she’s known for her visual essays that explore how developers understand systems, languages, and ideas. She’s a strong advocate for “digital gardens” over traditional publishing, and spends her time mapping out how knowledge grows on the web. Outside of work, she’s usually sketching concepts, writing, or connecting dots between code and culture.`,
        image: 'images/campaigns/beyond-the-prompt/svg/maggie.svg',
        imageOrange: 'images/campaigns/beyond-the-prompt/svg/maggie-orange-bg.svg',
    },
    {
        name: 'Sophie Koonin',
        title: 'Web Discipline Lead, Monzo',
        bio: `Sophie leads a team within the Operations collective at Monzo, building the software that powers the bank's award-winning customer experience. She's also Monzo's Web Discipline Lead, advocating for web and empowering others to lead web platform improvements throughout the company. Outside of work, Sophie loves arranging pop songs for her choir Mixtape, playing video games, cooking, and gardening.`,
        image: 'images/campaigns/beyond-the-prompt/svg/sophie.svg',
        imageOrange: 'images/campaigns/beyond-the-prompt/svg/sophie-orange-bg.svg',
    },
    {
        name: 'David Khourshid',
        title: 'Founder, Stately.ai',
        bio: `David is the founder of Stately.ai and creator of XState, the most popular open-source state machine & statecharts library. He's a longtime advocate for event-driven modeling and visual diagramming as the foundation for reliable UIs and, increasingly, AI agents. When he's not at a computer keyboard, he's at a piano keyboard.`,
        image: 'images/campaigns/beyond-the-prompt/svg/david-kourshid.svg',
        imageOrange: 'images/campaigns/beyond-the-prompt/svg/david-kourshid-orange-bg.svg',
    },
    {
        name: 'Mats Bryntse',
        title: 'Founder & CEO, Bryntum',
        bio: `Mats is the founder and CEO of Bryntum, where he and his team build advanced scheduling and project planning tools for modern web apps. For the past 15 years, he has obsessed over JavaScript performance, developer experience, and making complex UIs feel simple. He used to enjoy chess, badminton, and independent thought, until Claude entered his life and optimized those away.`,
        image: 'images/campaigns/beyond-the-prompt/svg/mats.svg',
        imageOrange: 'images/campaigns/beyond-the-prompt/svg/mats-orange-bg.svg',
        imageFit: 'contain',
    },
    {
        name: 'Steve Ruiz',
        title: 'CEO, tldraw',
        bio: `A developer, designer, and now startup founder in London. With a background in visual art, Steve works primarily in creative tools for the web. He is known for tldraw, and demos of perfect arrows.`,
        image: 'images/campaigns/beyond-the-prompt/svg/steve-ruiz.svg',
        imageOrange: 'images/campaigns/beyond-the-prompt/svg/steve-ruiz-bg.svg',
    },
    {
        name: 'Matt Pocock',
        title: 'Senior Developer Educator, AI Hero',
        bio: `Matt is a senior developer educator at AI Hero, a TypeScript author, and an educator passionate about bringing real software engineering rigour to the age of AI. He co-organizes the AI Coding for Real Engineers cohort, a community for experienced developers who want to build with AI tools without throwing away everything they already know. Outside of the keyboard, Matt enjoys long runs through the Oxfordshire countryside, loudly supporting Arsenal, and experimenting with new ways to make complex ideas click for developers everywhere.`,
        image: 'images/campaigns/beyond-the-prompt/svg/matt-pocock.svg',
        imageOrange: 'images/campaigns/beyond-the-prompt/svg/matt-pocock-orange-bg.svg',
    },
    {
        name: 'Bernie Sumption',
        title: 'Engineer, AG Grid',
        bio: `Bernie is an engineer at AG Grid specialising in theming. "The other engineers make it work fast and well, I make it look pretty" he likes to say. Outside work he goes hiking, plays with his kids, and once made a tweeting cat flap that has 10x more social media followers than he does.`,
        image: 'images/campaigns/beyond-the-prompt/svg/bernie.svg',
        imageOrange: 'images/campaigns/beyond-the-prompt/svg/bernie-orange-bg.svg',
    },
    {
        name: 'Josh Hobson',
        title: 'Developer, AG Grid',
        bio: `Josh is a developer at AG Grid, where he's been building AG Studio, a new dashboard library with multi-agent AI baked in. He's a mathematician by training and a maker by instinct, with a particular love for developer tooling, type systems, and intelligent interfaces. Outside of work, Josh can be found tinkering with 3D printers, ski touring in the Alps, or out on long walks with his dog.`,
        image: 'images/campaigns/beyond-the-prompt/svg/josh.svg',
        imageOrange: 'images/campaigns/beyond-the-prompt/svg/josh-orange-bg.svg',
    },
    {
        name: 'Adam Wang',
        title: 'AG Studio Product Lead, AG Grid',
        bio: `Adam is the AG Studio Product Lead at AG Grid, with around 10 years of experience in product management across various disciplines. He previously worked on AG Grid Integrated Charts before focusing on AG Studio. He enjoys the creative process of product management and is keen to solve problems by truly understanding user needs. Outside of work, he's a spin instructor who loves to put together a fire playlist. He also collects coloured vinyl.`,
        image: 'images/campaigns/beyond-the-prompt/svg/adam.svg',
        imageOrange: 'images/campaigns/beyond-the-prompt/svg/adam-orange-bg.svg',
    },
    {
        name: 'Patrick Rau',
        title: 'Senior Developer, TCS',
        bio: `Patrick builds and maintains core parts of Team Centric Software's fleetplan platform, specializing in UI integration and complex components like AG Grid, Bryntum's Scheduler Pro, and modules for audit tracking and safety reporting. He's driven by a passion for creating software that makes a real difference for the people who use it. When he's not solving problems at work, you'll find him exploring new technologies through personal projects, gaming, or planning his next trip.`,
        image: 'images/campaigns/beyond-the-prompt/svg/patrick-rau.svg',
        imageOrange: 'images/campaigns/beyond-the-prompt/svg/patrick-rau-bg.svg',
    },
    {
        name: 'Johan Isaksson',
        title: 'Head of Engineering, Bryntum',
        bio: `Johan is responsible for architecture, gate keeping, performance and styling across all Bryntum products. When not checking pull requests, recording performance profiles or tweaking CSS he enjoys watching hockey and playing floorball.`,
        image: 'images/campaigns/beyond-the-prompt/svg/johan.svg',
        imageOrange: 'images/campaigns/beyond-the-prompt/svg/johan-orange-bg.svg',
    },
    {
        name: 'John Masterson',
        title: 'CEO, AG Grid',
        bio: `John is the CEO of AG Grid, which he first joined in 2016 as employee number two. After a detour as CTO of a London health-tech startup, he returned in 2020 and stepped into the CEO role in 2024. He's spent fifteen years building software and leading engineering teams, and is determined to keep AG Grid the first choice for JavaScript developers. Outside of work, John can be found on his bike, in his headphones listening to a podcast, or picking up a guitar.`,
        image: 'images/campaigns/beyond-the-prompt/svg/john.svg',
        imageOrange: 'images/campaigns/beyond-the-prompt/svg/john-orange-bg.svg',
        imageFit: 'contain',
    },
    {
        name: 'Phil Hawksworth',
        title: 'Event MC',
        bio: `With a passion for browser technologies, and the empowering properties of the web, Phil loves seeking out ingenuity and simplicity, especially in places where over-engineering is common. After 25 years of building web applications for companies such as Google, Apple, Nike, R/GA, and The London Stock Exchange, he has worked to challenge traditional technical architectures in favour of simplicity and effectiveness, working in Developer Experience at Netlify and Deno.`,
        image: 'images/campaigns/beyond-the-prompt/svg/phil.svg',
        imageOrange: 'images/campaigns/beyond-the-prompt/svg/phil-orange-bg.svg',
    },
];

// Slugify a session title for its /session/<slug> URL.
export const sessionSlug = (title: string): string =>
    title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

// Slug for the 30x30 / 120x120 speaker-head PNGs, e.g. "John Masterson" ->
// "john-masterson".
export const headSlug = (name: string): string =>
    name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

// Pull the 11-character video id out of a YouTube watch / youtu.be / embed URL.
export const youtubeId = (url: string): string | null => {
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    return match ? match[1] : null;
};

// Branded 1600x900 thumbnails live in /images/.../thumbnails/<slug>.webp, one per
// speaker. Group talks pick a single representative speaker; the rest default to
// their (only) speaker.
const THUMB_OVERRIDE: Record<string, string> = {
    'Opening Keynote': 'john-masterson',
    'Product Roadmap': 'johan-isaksson',
    'How agentic AI Is reshaping software engineering': 'maggie-appleton',
};

// Speakers we have a thumbnail image for. Sessions whose chosen speaker is not
// here (Patrick Rau, Steve Ruiz) fall back to the YouTube thumbnail.
const THUMBS_AVAILABLE = new Set([
    'john-masterson',
    'david-khourshid',
    'stephen-cooper',
    'josh-hobson',
    'bernie-sumption',
    'johan-isaksson',
    'mats-bryntse',
    'maggie-appleton',
    'matt-webb',
    'patrick-rau',
]);

// The branded thumbnail slug for a session, or null to fall back to YouTube.
export const sessionThumbSlug = (session: Session): string | null => {
    const slug = THUMB_OVERRIDE[session.title] ?? (session.speakers ? headSlug(session.speakers[0].name) : '');
    return THUMBS_AVAILABLE.has(slug) ? slug : null;
};

// Talk runtimes (minutes, rounded to the nearest 5) keyed by YouTube id, taken
// from each recording's actual length.
const DURATION_MINS: Record<string, number> = {
    'XY30-iUTB3E': 25,
    uMvTAF280so: 30,
    q61M5ch5dVs: 20,
    erP7U61RqL0: 25,
    TDvXe6XHU3c: 25,
    GCJv3w5CDbI: 30,
    mB4odIH_V1w: 15,
    C_Ii7v4AWvw: 25,
    gTjoAERDB5M: 25,
    q5H2Lcjo29E: 45,
    mcHscAcv288: 30,
};

// Rounded runtime in minutes for a session's recording, or null if unknown.
export const sessionDurationMins = (session: Session): number | null => {
    const id = session.youtubeUrl ? youtubeId(session.youtubeUrl) : null;
    return id ? (DURATION_MINS[id] ?? null) : null;
};
