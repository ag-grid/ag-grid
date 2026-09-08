import type { Framework } from '@ag-grid-types';
import { type MarkdownFramework, renderMarkdocToMarkdown } from '@ag-website-shared/markdoc/renderMarkdocToMarkdown';
import { getDocsPages } from '@components/docs/utils/pageData';
import { DISABLE_MARKDOWN_DOCS, SITE_URL, agGridVersion } from '@constants';
import { docsPageDescription } from '@utils/docsPageDescription';
import { getDocsRelatedLinks } from '@utils/docsRelatedLinks';
import { createGridMarkdownResolvers } from '@utils/markdoc/renderMarkdocResolvers';
import { GRID_PRODUCT_NAME, llmsTxtUrl } from '@utils/markdown-pages/gridFrontmatter';
import { type CollectionEntry, getCollection, getEntry } from 'astro:content';

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

    const { data: docsNavData } = (await getEntry('docsNav', 'nav')) as CollectionEntry<'docsNav'>;
    const { data: apiNavData } = (await getEntry('apiNav', 'nav')) as CollectionEntry<'apiNav'>;

    const markdown = await renderMarkdocToMarkdown({
        body: page.body ?? '',
        framework,
        pageName,
        frontmatter: {
            title: page.data.title,
            // The description the HTML page puts in its meta tag: the page's own frontmatter
            // where it has one, otherwise its opening paragraph. Without the SEO tagline the
            // HTML appends, which is marketing copy rather than a summary of the page.
            description: docsPageDescription({
                framework: framework as Framework,
                pageDescription: page.data.description,
                body: page.body ?? '',
            }),
            enterprise: page.data.enterprise,
        },
        product: GRID_PRODUCT_NAME,
        // The page's nav neighbours, so a reader holding only this file can still navigate.
        related: getDocsRelatedLinks({
            navSections: [docsNavData.sections, apiNavData.sections],
            pageName,
            framework: framework as Framework,
            siteRoot,
            overrides: page.data.related,
        }),
        llmsTxt: llmsTxtUrl(siteRoot),
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
