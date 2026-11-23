import { sortHubCards } from '@ag-website-shared/components/decision-pages/decisionHub';
import { buildDecisionHubMarkdown } from '@ag-website-shared/markdown-pages/decision-pages/buildDecisionHubMarkdown';
import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { ALTERNATIVES_HUB, GRID_DECISION_SITE, alternativeHubCard } from '@utils/decisionPages';
import { gridSiteFrontmatter } from '@utils/markdown-pages/gridFrontmatter';
import { getCollection } from 'astro:content';

// Served at /alternatives.md, the markdown twin of the /alternatives/ hub.
export async function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }

    const entries = await getCollection('alternativePages');
    const markdown = buildDecisionHubMarkdown({
        hub: ALTERNATIVES_HUB,
        cards: sortHubCards(entries.map(({ id, data }) => alternativeHubCard(id, data))),
        site: GRID_DECISION_SITE,
        siteRoot: SITE_URL,
        siteFrontmatter: gridSiteFrontmatter({ siteRoot: SITE_URL }),
    });

    return new Response(markdown, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
