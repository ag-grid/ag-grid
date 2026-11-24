import { buildSolutionPageMarkdown } from '@ag-website-shared/markdown-pages/decision-pages/buildSolutionPageMarkdown';
import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { getDecisionPageCollections } from '@utils/decisionPageCollections';
import { GRID_DECISION_SITE, solutionPagePaths } from '@utils/decisionPages';
import { gridSiteFrontmatter } from '@utils/markdown-pages/gridFrontmatter';

// Served at /solutions/<slug>.md, the markdown twin of each solution page, rendered from the same
// collection entry and related links as the page.
export async function getStaticPaths() {
    if (DISABLE_MARKDOWN_DOCS) {
        return [];
    }

    return solutionPagePaths(await getDecisionPageCollections());
}

export function GET({ props }: { props: ReturnType<typeof solutionPagePaths>[number]['props'] }) {
    const markdown = buildSolutionPageMarkdown({
        content: props.content,
        site: GRID_DECISION_SITE,
        related: props.related,
        siteRoot: SITE_URL,
        siteFrontmatter: gridSiteFrontmatter({ siteRoot: SITE_URL }),
    });

    return new Response(markdown, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
