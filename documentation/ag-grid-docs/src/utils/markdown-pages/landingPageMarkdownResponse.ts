import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { getEntry } from 'astro:content';

import { buildGridLandingPageMarkdown } from './buildGridLandingPageMarkdown';

/**
 * Shared body of the landing-page `.md` endpoints. Every landing page renders through the same
 * `LandingPage.astro` template from its `landingPages` collection entry, so its markdown twin is
 * the same builder over the same entry — only the slug differs.
 */
export async function landingPageMarkdownResponse(slug: string): Promise<Response> {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }

    const contentEntry = await getEntry('landingPages', slug);
    if (!contentEntry) {
        return new Response(null, { status: 404 });
    }
    const versionsEntry = await getEntry('versions', 'ag-grid-versions');

    const markdown = buildGridLandingPageMarkdown({
        content: contentEntry.data,
        versions: versionsEntry?.data,
        siteRoot: SITE_URL,
    });

    return new Response(markdown, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
