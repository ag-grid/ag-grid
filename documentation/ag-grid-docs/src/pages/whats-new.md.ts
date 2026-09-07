import { buildWhatsNewMarkdown } from '@ag-website-shared/markdown-pages/buildWhatsNewMarkdown';
import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { gridSiteFrontmatter } from '@utils/markdown-pages/gridFrontmatter';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import { type CollectionEntry, getEntry } from 'astro:content';

// Served at /whats-new.md — a markdown twin of the /whats-new page for LLMs, built from the same
// versions collection and shared product metadata the page renders. Content-negotiates from the
// HTML URL on Accept: text/markdown (see the SE-80 rules in htaccessRules.ts).
export async function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }

    const { data: versionsData } = (await getEntry('versions', 'ag-grid-versions')) as CollectionEntry<'versions'>;

    const output = buildWhatsNewMarkdown({
        site: 'grid',
        versionsData,
        siteRoot: SITE_URL,
        // Highlight and release-note paths are framework-relative; the page resolves them against
        // the reader's remembered framework, so the twin picks the framework-agnostic core.
        resolveUrl: (url) => urlWithPrefix({ framework: 'javascript', url }),
        siteFrontmatter: gridSiteFrontmatter({ pageUrl: '/whats-new/', siteRoot: SITE_URL }),
    });

    return new Response(output, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
