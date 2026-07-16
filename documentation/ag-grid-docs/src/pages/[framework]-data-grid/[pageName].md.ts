import { type MarkdownFramework, renderMarkdocToMarkdown } from '@ag-website-shared/markdoc/renderMarkdocToMarkdown';
import { getDocsPages } from '@components/docs/utils/pageData';
import { DISABLE_MARKDOWN_DOCS, SITE_URL, agGridVersion } from '@constants';
import { createGridMarkdownResolvers } from '@utils/markdoc/renderMarkdocResolvers';
import { type CollectionEntry, getCollection } from 'astro:content';

import markdocConfig from '../../../markdoc.config';

// Served at /<framework>-data-grid/<pageName>.md — a clean, framework-resolved
// markdown version of each docs page for LLMs. Generated at build time from the
// same `docs` collection and framework fan-out as the HTML pages, so the URLs
// line up 1:1. Endpoint routes are served live in the dev server too.
export async function getStaticPaths() {
    if (DISABLE_MARKDOWN_DOCS) {
        return [];
    }
    const pages = await getCollection('docs');
    return getDocsPages(pages);
}

export async function GET({
    props,
    params,
}: {
    props: { page: CollectionEntry<'docs'> };
    params: Record<string, string>;
}) {
    const { page } = props;
    const framework = params.framework as MarkdownFramework;
    const pageName = params.pageName;

    // Use the current environment's origin (dev/staging/prod) so links resolve to the
    // same site the .md is served from, not always production.
    const siteRoot = SITE_URL;
    const resolvers = createGridMarkdownResolvers({ siteRoot });

    const markdown = await renderMarkdocToMarkdown({
        body: page.body ?? '',
        framework,
        pageName,
        frontmatter: { title: page.data.title, description: page.data.description },
        // Release version only — drop the beta/build suffix (e.g. 36.0.0-beta.2026… → 36.0.0).
        version: agGridVersion.split('-')[0],
        // Per-page Markdoc variables the site injects via <Content> props, so tags like
        // migrationVersion()/$migrationVersion resolve as they do on the HTML page.
        variables: { migrationVersion: page.data.migrationVersion },
        markdocConfig,
        resolvers,
    });

    return new Response(markdown, {
        status: 200,
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
        },
    });
}
