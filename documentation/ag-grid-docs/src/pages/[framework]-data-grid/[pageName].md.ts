import { type MarkdownFramework, renderMarkdocToMarkdown } from '@ag-website-shared/markdoc/renderMarkdocToMarkdown';
import { siteRootUrl } from '@ag-website-shared/utils/structuredData';
import { getDocsPages } from '@components/docs/utils/pageData';
import { DISABLE_MARKDOWN_DOCS, agGridVersion } from '@constants';
import { createGridMarkdownResolvers } from '@utils/markdoc/renderMarkdocResolvers';
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

    const { data: metadata } = (await getEntry('metadata', 'metadata')) as CollectionEntry<'metadata'>;
    const siteRoot = siteRootUrl(metadata.canonicalUrlBase);
    const resolvers = createGridMarkdownResolvers({ siteRoot });

    const markdown = await renderMarkdocToMarkdown({
        body: page.body ?? '',
        framework,
        pageName,
        frontmatter: { title: page.data.title, description: page.data.description },
        version: agGridVersion,
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
