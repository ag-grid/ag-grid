import { buildProductAlternativePageMarkdown } from '@ag-website-shared/markdown-pages/decision-pages/buildProductAlternativePageMarkdown';
import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { getDecisionPageCollections } from '@utils/decisionPageCollections';
import { GRID_DECISION_SITE, PRODUCT_ALTERNATIVE_SLUG, productAlternativePageProps } from '@utils/decisionPages';
import { gridSiteFrontmatter } from '@utils/markdown-pages/gridFrontmatter';

// Served at /alternatives/ag-grid-alternative.md, the markdown twin of AG Grid's own alternative
// page, rendered from the same content entry and related links.
export async function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }

    const { content, related } = productAlternativePageProps(
        await getDecisionPageCollections(),
        PRODUCT_ALTERNATIVE_SLUG
    );
    const markdown = buildProductAlternativePageMarkdown({
        content,
        site: GRID_DECISION_SITE,
        related,
        siteRoot: SITE_URL,
        siteFrontmatter: gridSiteFrontmatter({ siteRoot: SITE_URL }),
    });

    return new Response(markdown, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
