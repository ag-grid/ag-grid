import type { Framework } from '@ag-grid-types';
import { getDocsPages } from '@components/docs/utils/pageData';
import { markdocToMarkdown } from '@utils/markdoc/markdocToMarkdown';
import type { APIRoute } from 'astro';
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
    const pages = await getCollection('docs');
    return getDocsPages(pages);
}

export const GET: APIRoute = async ({ props, params }) => {
    const { page } = props;

    const framework = params.framework as Framework;

    const markdown = markdocToMarkdown(page.body, { framework });

    return new Response(markdown, {
        status: 200,
        headers: {
            'Content-Type': 'text/markdown',
        },
    });
};
