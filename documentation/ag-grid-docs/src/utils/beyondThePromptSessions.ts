// Shared session data for the Beyond the Prompt page and its /session/<slug>
// recording pages. Kept here (rather than inline in the page) so the dynamic
// route can build a real, crawlable page per recorded session.

export type Session = {
    title: string;
    speakers?: string;
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
        speakers: 'John Masterson (CEO, AG Grid) & Mats Bryntse (Founder & CEO, Bryntum)',
    },
    {
        title: 'Goodbye slop; welcome determinism',
        speakers: 'David Khourshid',
        description:
            'Vibe coding feels productive until you have to maintain it. Come for the critique of the nondeterministic status quo, leave with a framework for using AI to build software you actually understand.',
        youtubeUrl: 'https://www.youtube.com/watch?v=uMvTAF280so',
    },
    {
        title: 'Codebase design for the agent era',
        speakers: 'Stephen Cooper (Team Lead, AG Grid)',
        description:
            "As AI agents become part of the development workflow, codebase structure and well-designed system prompts matter more than ever. This session showed how we're approaching this in the AG Grid and AG Charts codebases..",
    },
    {
        title: 'AI in AG Studio',
        speakers: 'Josh Hobson (Developer, AG Grid)',
        description:
            "How do you build a dashboard you can't see? A behind-the-scenes look at AG Studio's multi-agent architecture and the client-side tools that let any LLM build reports it otherwise couldn't.",
    },
    {
        title: 'Bringing AI to the Canvas',
        speakers: 'Steve Ruiz (CEO, tldraw)',
        description: `At tldraw, we've been bringing agents to our infinite canvas. In December 2025, we ran a one-month experiment named Fairydraw where users could work with three fairies - virtual collaborators who work with you, with your human collaborators, and coordinate together on large tasks.`,
    },
    {
        title: 'Debugging CSS performance with AI',
        speakers: 'Bernie Sumption (Developer, AG Grid)',
        description:
            'CSS performance issues can be subtle and time-consuming. This talk showed how you can guide AI to uncover bugs without needing to learn the intricacies of CSS rendering internals.',
    },
    {
        title: 'Software that moves fleets: Lessons from AG Grid, Bryntum, and Beyond',
        speakers: 'Patrick Rau (Developer, TCS)',
        description:
            "In aviation, the software has to be rock solid. Patrick pulled back the curtain on the components powering Fleetplan's UI, including AG Grid, Bryntum's Scheduler Pro, and the modules behind audit tracking and safety reporting that keep operations airtight.",
    },
    {
        title: 'Product Roadmap',
        speakers: 'Johan Isaksson (Head of Engineering, Bryntum) & Adam Wang (AG Studio Product Lead, AG Grid)',
        description: "A detailed look at our roadmap, covering AG Grid and Bryntum's suite of tools.",
    },
    {
        title: 'One-click agentic SDLC',
        speakers: 'Mats Bryntse (Founder & CEO, Bryntum)',
        description:
            'A demo of a headless Claude workflow, built by Bryntum CEO Mats, that turns GitHub issues into mergeable PRs, with agents doing the work, and a custom Kanban UI keeping things in check.',
    },
    {
        title: 'How agentic AI Is reshaping software engineering',
        speakers:
            'Maggie Appleton (Staff Research Engineer, GitHub), Matt Pocock (Senior Developer Educator, AI Hero), Sophie Koonin (Web Discipline Lead, Monzo)',
        description:
            'As AI reshapes how software gets built, what actually changes for engineers, teams, and developer tools? This panel explored the real-world impact of agentic workflows on software engineering - from code review and system design to cognitive skills, ownership, and developer experience. Practical insights, rapid-fire hot takes, and honest discussion from engineers building beyond the prompt.',
    },
    {
        title: 'Vibe Coding as a Maker',
        speakers: 'Matt Webb',
        description:
            'Matt showed his vibe coding experiments, from his AI clock to an app that points to the centre of the galaxy, and shared some learnings from building hardware at his startup, Inanimate. Then we asked: what are the limits of vibing and agentic coding? And how might we create libraries that agents love?',
    },
];

// Slugify a session title for its /session/<slug> URL.
export const sessionSlug = (title: string): string =>
    title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

// Pull the 11-character video id out of a YouTube watch / youtu.be / embed URL.
export const youtubeId = (url: string): string | null => {
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    return match ? match[1] : null;
};
