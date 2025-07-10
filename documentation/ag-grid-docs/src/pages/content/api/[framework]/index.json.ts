import type { Framework } from '@ag-grid-types';
import { getDocsEntries } from '@ag-website-shared/utils/content-api/getDocsEntries';
import { FRAMEWORKS } from '@constants';
import type { APIRoute } from 'astro';
import { type CollectionEntry, getEntry } from 'astro:content';

interface Params {
    framework: Framework;
}

export async function getStaticPaths() {
    return FRAMEWORKS.map((framework) => {
        return {
            params: {
                framework,
            },
        };
    });
}

export const GET: APIRoute<Params> = async ({ params }) => {
    const { data: navData } = (await getEntry('apiNav', 'nav')) as CollectionEntry<'apiNav'>;
    const { framework } = params;
    const docs = await getDocsEntries({ framework: framework as Framework, navData });

    return new Response(JSON.stringify(docs), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};
