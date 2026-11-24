import { buildDecisionHubMarkdown } from '@ag-website-shared/markdown-pages/decision-pages/buildDecisionHubMarkdown';
import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { getDecisionPageCollections } from '@utils/decisionPageCollections';
import { GRID_DECISION_SITE, SOLUTIONS_HUB, solutionsHubCards } from '@utils/decisionPages';
import { gridSiteFrontmatter } from '@utils/markdown-pages/gridFrontmatter';

// Served at /solutions.md, the markdown twin of the /solutions/ hub.
export async function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }

    const markdown = buildDecisionHubMarkdown({
        hub: SOLUTIONS_HUB,
        cards: solutionsHubCards(await getDecisionPageCollections()),
        site: GRID_DECISION_SITE,
        siteRoot: SITE_URL,
        siteFrontmatter: gridSiteFrontmatter({ siteRoot: SITE_URL }),
    });

    return new Response(markdown, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
