import { DISABLE_MARKDOWN_DOCS, FRAMEWORK_LANDING_HUBS } from '@constants';
import { landingPageMarkdownResponse } from '@utils/markdown-pages/landingPageMarkdownResponse';

// Served at /<framework>-data-grid.md — the markdown twin of the framework landing hub, built
// from the same landing-pages/<framework>-data-grid.json the hub renders. Content-negotiates from
// the HTML URL on Accept: text/markdown (see the SE-80 rules in htaccessRules.ts).
export function getStaticPaths() {
    if (DISABLE_MARKDOWN_DOCS) {
        return [];
    }

    return FRAMEWORK_LANDING_HUBS.map((framework) => ({ params: { framework } }));
}

export const GET = ({ params }: { params: Record<string, string> }) =>
    landingPageMarkdownResponse(`${params.framework}-data-grid`);
