import { buildAlternativePageMarkdown } from '@ag-website-shared/markdown-pages/decision-pages/buildAlternativePageMarkdown';
import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { getDecisionPageCollections } from '@utils/decisionPageCollections';
import { GRID_DECISION_SITE, alternativePagePaths } from '@utils/decisionPages';
import { gridSiteFrontmatter } from '@utils/markdown-pages/gridFrontmatter';

// Served at /alternatives/<slug>.md, the markdown twin of each alternative page. It renders from the
// same collection entry, comparison link and related links as the page, so the two cannot drift.
export async function getStaticPaths() {
    if (DISABLE_MARKDOWN_DOCS) {
        return [];
    }

    return alternativePagePaths(await getDecisionPageCollections());
}

export function GET({ props }: { props: ReturnType<typeof alternativePagePaths>[number]['props'] }) {
    const markdown = buildAlternativePageMarkdown({
        content: props.content,
        site: GRID_DECISION_SITE,
        comparison: props.comparison,
        related: props.related,
        siteRoot: SITE_URL,
        siteFrontmatter: gridSiteFrontmatter({ siteRoot: SITE_URL }),
    });

    return new Response(markdown, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
