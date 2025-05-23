import { getEntry } from 'astro:content';

export async function GET() {
    const { data: versionsContent } = await getEntry('versions', 'ag-grid-versions');

    return new Response(JSON.stringify(versionsContent), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
