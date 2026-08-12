import { buildRoadmapMarkdown } from '@ag-website-shared/markdown-pages/buildRoadmapMarkdown';
import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { urlWithPrefix } from '@utils/urlWithPrefix';

import roadmapData from '../../public/roadmap/roadmap.json';

// Served at /roadmap.md — a markdown twin of the /roadmap page for LLMs, built from the same
// roadmap.json the page renders. Content-negotiates from the HTML URL on Accept: text/markdown
// (see the SE-80 rules in htaccessRules.ts).
export function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }

    const output = buildRoadmapMarkdown({
        roadmapData,
        productName: 'AG Grid',
        siteRoot: SITE_URL,
        // The page is framework-agnostic; resolve its framework-prefixed links against a single
        // framework, matching the other markdown twins (homepage, license-pricing).
        resolveUrl: (url) => urlWithPrefix({ framework: 'javascript', url }),
        // The page labels quarters with the current year; the build stamps it here so the
        // generated markdown is deterministic within a build.
        year: new Date().getFullYear(),
    });

    return new Response(output, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
