import { buildDecisionHubMarkdown } from '@ag-website-shared/markdown-pages/decision-pages/buildDecisionHubMarkdown';
import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { getDecisionPageCollections } from '@utils/decisionPageCollections';
import { ALTERNATIVES_HUB, GRID_DECISION_SITE, alternativesHubCards } from '@utils/decisionPages';
import { gridSiteFrontmatter } from '@utils/markdown-pages/gridFrontmatter';

// Served at /alternatives.md, the markdown twin of the /alternatives/ hub.
export async function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }

    const markdown = buildDecisionHubMarkdown({
        hub: ALTERNATIVES_HUB,
        cards: alternativesHubCards(await getDecisionPageCollections()),
        site: GRID_DECISION_SITE,
        siteRoot: SITE_URL,
        siteFrontmatter: gridSiteFrontmatter({ siteRoot: SITE_URL }),
    });

    return new Response(markdown, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
