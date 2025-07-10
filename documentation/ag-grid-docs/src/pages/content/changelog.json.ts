import { PRODUCTION_CHANGELOG_JSON_URL } from '@constants';

export async function GET() {
    const changelogData = await fetch(PRODUCTION_CHANGELOG_JSON_URL);
    const changelog = await changelogData.text();

    return new Response(changelog, {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
