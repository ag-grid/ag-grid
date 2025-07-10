import { SITE_URL } from '@constants';
import { pathJoin } from '@utils/pathJoin';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { type CollectionEntry, getEntry } from 'astro:content';

export async function GET() {
    const { data } = (await getEntry('contentApi', 'content-api')) as CollectionEntry<'contentApi'>;
    const root = data.root || [];
    const contentApiListing = root.map(({ id, url }) => {
        return {
            id,
            url: pathJoin(SITE_URL, urlWithBaseUrl(url)),
        };
    });

    return new Response(JSON.stringify(contentApiListing), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
