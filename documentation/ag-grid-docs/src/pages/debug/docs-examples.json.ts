import { getDocsExampleContents } from '@components/docs/utils/pageData';
import { getCollection } from 'astro:content';

export async function GET() {
    const pages = await getCollection('docs');
    const exampleContents = await getDocsExampleContents({ pages });

    return new Response(JSON.stringify(exampleContents), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
