import { execSync } from 'child_process';

export async function GET() {
    const removeNewlineRegex = /\n/gm;
    const buildDate = new Date();
    const hash = execSync('git rev-parse HEAD').toString().replace(removeNewlineRegex, '');
    const shortHash = execSync('git rev-parse --short HEAD').toString().replace(removeNewlineRegex, '');
    const gitDate = execSync('git --no-pager log -1 --format="%ai"').toString().replace(removeNewlineRegex, '');

    const body = {
        buildDate,
        git: {
            hash,
            shortHash,
            date: gitDate,
        },
    };

    return new Response(JSON.stringify(body), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
