import { type CollectionEntry, getEntry } from 'astro:content';

export async function GET() {
    const { data } = (await getEntry('moduleMappings', 'modules')) as CollectionEntry<'moduleMappings'>;

    return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
