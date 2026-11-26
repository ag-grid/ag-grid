import { buildComparisonPageMarkdown } from '@ag-website-shared/markdown-pages/decision-pages/buildComparisonPageMarkdown';
import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { getDecisionPageCollections } from '@utils/decisionPageCollections';
import { GRID_DECISION_SITE, comparePagePaths, type decisionRelatedPages } from '@utils/decisionPages';
import { gridSiteFrontmatter } from '@utils/markdown-pages/gridFrontmatter';
import type { CollectionEntry } from 'astro:content';

// Served at /compare/<slug>.md, the markdown twin of each comparison page. It renders from the same
// collection entry and related links as the page, so the two cannot drift.
export async function getStaticPaths() {
    if (DISABLE_MARKDOWN_DOCS) {
        return [];
    }

    return comparePagePaths(await getDecisionPageCollections());
}

export function GET({
    props,
}: {
    props: { content: CollectionEntry<'comparePages'>['data']; related: ReturnType<typeof decisionRelatedPages> };
}) {
    const markdown = buildComparisonPageMarkdown({
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
