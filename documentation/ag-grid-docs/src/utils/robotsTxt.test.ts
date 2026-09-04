import { AI_CRAWLERS, productionRobotsTxt } from './robotsTxt';

// Representative Allow/Disallow paths, mirroring what the route feeds in production.
const ALLOW_PATHS = ['/campaigns/bryntum-gantt/'];
// Public example pages we want opened to AI.
const PUBLIC_EXAMPLE_DISALLOWS = [
    '/examples/',
    '/studio/examples/',
    '/charts/*/*/examples/',
    '/charts/gallery/examples/',
];
// Internal /debug/ example fixtures — contain "example" but must stay blocked for AI too.
const INTERNAL_EXAMPLE_DISALLOWS = [
    '/charts/debug/docs-example-files',
    '/charts/debug/docs-examples',
    '/charts/debug/gallery-example-files',
    '/charts/debug/gallery-examples',
];
// Non-example blocks that always apply.
const OTHER_DISALLOWS = ['/debug/', '/*-data-grid/*-test/', '/404', '/*searchQuery='];
// Everything the AI group must still enforce (internal fixtures + other blocks).
const AI_KEPT_DISALLOWS = [...INTERNAL_EXAMPLE_DISALLOWS, ...OTHER_DISALLOWS];
const DISALLOW_PATHS = [...PUBLIC_EXAMPLE_DISALLOWS, ...AI_KEPT_DISALLOWS];

// Split the robots.txt into groups on blank lines.
const getGroups = (txt: string) => txt.split(/\n\s*\n/).map((group) => group.trim());

describe('productionRobotsTxt — AI-crawler position (SE-78)', () => {
    const txt = productionRobotsTxt(ALLOW_PATHS, DISALLOW_PATHS);
    const groups = getGroups(txt);
    const wildcardGroup = groups.find((group) => group.startsWith('User-agent: *'))!;
    const aiGroup = groups.find((group) => group.startsWith('User-agent: GPTBot'))!;

    test('declares the "allow everything" Content-Signal explicitly on both groups', () => {
        expect(wildcardGroup).toContain('Content-Signal: search=yes, ai-input=yes, ai-train=yes');
        expect(aiGroup).toContain('Content-Signal: search=yes, ai-input=yes, ai-train=yes');
    });

    test('wildcard group keeps its full rule set, including the example Disallows', () => {
        expect(wildcardGroup).toContain('Allow: /');
        expect(wildcardGroup).toContain('Allow: /charts/');
        expect(wildcardGroup).toContain('Allow: /studio/');
        for (const path of [...ALLOW_PATHS]) {
            expect(wildcardGroup).toContain(`Allow: ${path}`);
        }
        for (const path of DISALLOW_PATHS) {
            expect(wildcardGroup).toContain(`Disallow: ${path}`);
        }
    });

    test('AI group names every welcomed AI crawler', () => {
        expect(aiGroup).toBeDefined();
        for (const bot of AI_CRAWLERS) {
            expect(aiGroup).toContain(`User-agent: ${bot}`);
        }
    });

    test('AI group opens the public example pages (those Disallows removed)', () => {
        for (const path of PUBLIC_EXAMPLE_DISALLOWS) {
            expect(aiGroup).not.toContain(`Disallow: ${path}`);
        }
    });

    test('AI group still applies every kept Disallow, including internal /debug/ example fixtures', () => {
        for (const path of AI_KEPT_DISALLOWS) {
            expect(aiGroup).toContain(`Disallow: ${path}`);
        }
        // The internal fixtures contain "example" but must remain blocked for AI.
        for (const path of INTERNAL_EXAMPLE_DISALLOWS) {
            expect(aiGroup).toContain(`Disallow: ${path}`);
        }
    });

    test('search engines stay blocked from all examples: only public examples are opened, for AI', () => {
        // Every example path (public + internal) is a Disallow on the wildcard group.
        for (const path of [...PUBLIC_EXAMPLE_DISALLOWS, ...INTERNAL_EXAMPLE_DISALLOWS]) {
            expect(wildcardGroup).toContain(`Disallow: ${path}`);
        }
        expect(aiGroup).not.toContain('Disallow: /examples/');
    });

    test('Googlebot is never named, so it falls through to the wildcard (examples blocked)', () => {
        // robots.txt groups do not inherit: naming Googlebot would drop the wildcard rules for it.
        expect(txt).not.toContain('User-agent: Googlebot');
        // Google-Extended is a separate token (Gemini/Vertex training) and IS welcomed in the AI group.
        expect(aiGroup).toContain('User-agent: Google-Extended');
    });

    test('emits exactly two user-agent groups (wildcard + AI) plus the sitemap', () => {
        const userAgentGroups = groups.filter((group) => group.startsWith('User-agent:'));
        expect(userAgentGroups).toHaveLength(2);
        expect(txt).toContain('Sitemap: ');
        expect(txt).toContain('sitemap-index.xml');
    });
});
