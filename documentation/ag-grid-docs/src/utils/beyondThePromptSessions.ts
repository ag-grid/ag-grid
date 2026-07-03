// Shared session data for the Beyond the Prompt page and its /session/<slug>
// recording pages. Kept here (rather than inline in the page) so the dynamic
// route can build a real, crawlable page per recorded session.

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
