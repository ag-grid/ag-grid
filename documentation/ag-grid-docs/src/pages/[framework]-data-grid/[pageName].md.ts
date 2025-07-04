import { getDocsPages } from '@components/docs/utils/pageData';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
    const pages = await getCollection('docs');
    return getDocsPages(pages);
}

export const GET: APIRoute = ({ props }) => {
    const { page } = props;

    // TODO: Parse out `if` tags, and expand partials
    // Use html renderer and convert back to markdown?
    const body = page.body;

    return new Response(body, {
        status: 200,
        headers: {
            'Content-Type': 'text/markdown',
        },
    });
};
