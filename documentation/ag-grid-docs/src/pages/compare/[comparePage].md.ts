import { buildComparisonPageMarkdown } from '@ag-website-shared/markdown-pages/decision-pages/buildComparisonPageMarkdown';
import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { GRID_DECISION_SITE, compareRelatedPages } from '@utils/decisionPages';
import { gridSiteFrontmatter } from '@utils/markdown-pages/gridFrontmatter';
import { type CollectionEntry, getCollection } from 'astro:content';

// Served at /compare/<slug>.md, the markdown twin of each comparison page. It renders from the same
// collection entry and related links as the page, so the two cannot drift.
export async function getStaticPaths() {
    if (DISABLE_MARKDOWN_DOCS) {
        return [];
    }

    const entries = await getCollection('comparePages');
    const pages = entries.map(({ id, data }) => ({ slug: id, content: data }));
    return pages.map(({ slug, content }) => ({
        params: { comparePage: slug },
        props: { content, related: compareRelatedPages({ slug, pages }) },
    }));
}

export function GET({
    props,
}: {
    props: { content: CollectionEntry<'comparePages'>['data']; related: ReturnType<typeof compareRelatedPages> };
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
