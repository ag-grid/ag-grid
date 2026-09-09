import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { GRID_PRODUCT_NAME } from '@utils/markdown-pages/gridFrontmatter';
import fs from 'node:fs';
import path from 'node:path';

import { changelogToMarkdown } from '../../../../scripts/jira/production/jiraDataToMarkdown.mjs';

// Served at /changelog.md — a markdown twin of the /changelog page for LLMs, built
// from the same public/changelog/changelog.json the page fetches. On production the
// cron overwrites this file with fresh Jira data via the same transform (see
// scripts/jira/production/getChangelog.sh), so the build output is the fallback and
// cannot drift from the JSON. The HTML URL content-negotiates to this file on
// Accept: text/markdown (see the SE-80 rules in htaccessRules.ts).
export async function GET() {
    if (DISABLE_MARKDOWN_DOCS) {
        return new Response(null, { status: 404 });
    }

    const dataPath = path.join(process.cwd(), 'public/changelog/changelog.json');
    const entries = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    return new Response(changelogToMarkdown(entries, GRID_PRODUCT_NAME, SITE_URL), {
        status: 200,
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
        },
    });
}
