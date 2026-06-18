// Advisory semantic review of locale translation changes.
//
// Compares changed locale files against the en-US source of truth using the
// Anthropic Messages API and writes a Markdown report to REPORT_PATH. This is
// advisory only — it never fails the build. The deterministic structural checks
// (matching key sets) live in the package's `translations` test.
//
// Raw fetch is used deliberately: AG products forbid third-party runtime
// dependencies and CI ships no Anthropic SDK, so a dependency-free HTTP call is
// the right fit here. The script is product-neutral — the locale directory is
// supplied via LOCALE_SRC_DIR so the same file works for any AG locale package.
//
// Env:
//   LOCALE_SRC_DIR     required — locale source dir (e.g. community-modules/locale/src)
//   ANTHROPIC_API_KEY  required — when absent the script logs and exits 0 (e.g. fork PRs)
//   BASE_SHA           base ref to diff against (PR base, or origin/latest for dispatch)
//   HEAD_SHA           head ref (defaults to HEAD)
//   REPORT_PATH        where to write the Markdown report (default ./l10n-review.md)
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const SRC_DIR = process.env.LOCALE_SRC_DIR;
const MODEL = 'claude-opus-4-8';
const REPORT_PATH = process.env.REPORT_PATH || 'l10n-review.md';

function git(args) {
    return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trimEnd();
}

function changedLocaleFiles(base, head) {
    const out = git(['diff', '--name-only', `${base}...${head}`, '--', `${SRC_DIR}/*.ts`]);
    return out
        .split('\n')
        .filter(Boolean)
        .filter((f) => /\/[a-z]{2}-[A-Z]{2}\.ts$/.test(f) && !f.endsWith('en-US.ts')); // translated locales only — en-US is the source, not a translation
}

async function callAnthropic(apiKey, system, userText) {
    const body = {
        model: MODEL,
        max_tokens: 16000,
        thinking: { type: 'adaptive' },
        system,
        messages: [{ role: 'user', content: userText }],
    };

    for (let attempt = 1; attempt <= 3; attempt++) {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            const data = await res.json();
            return data.content
                .filter((b) => b.type === 'text')
                .map((b) => b.text)
                .join('')
                .trim();
        }

        // Retry transient failures; give up on client errors.
        if (res.status === 429 || res.status >= 500) {
            console.error(`Anthropic API ${res.status}; retry ${attempt}/3`);
            await new Promise((r) => setTimeout(r, attempt * 2000));
            continue;
        }
        throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
    }
    throw new Error('Anthropic API: retries exhausted');
}

async function main() {
    if (!SRC_DIR) {
        console.log('LOCALE_SRC_DIR not set — nothing to review.');
        return;
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        console.log('ANTHROPIC_API_KEY not set — skipping translation review.');
        return;
    }

    const base = process.env.BASE_SHA;
    const head = process.env.HEAD_SHA || 'HEAD';
    if (!base) {
        console.log('BASE_SHA not set — nothing to diff.');
        return;
    }

    const files = changedLocaleFiles(base, head);
    if (files.length === 0) {
        console.log('No translated locale files changed — skipping review.');
        return;
    }
    console.log(`Reviewing ${files.length} changed locale file(s): ${files.join(', ')}`);

    const enUs = readFileSync(`${SRC_DIR}/en-US.ts`, 'utf8');
    const diffs = files
        .map((f) => `### ${f}\n\n\`\`\`diff\n${git(['diff', `${base}...${head}`, '--', f])}\n\`\`\``)
        .join('\n\n');

    const system = [
        'You are reviewing translation changes for an AG product locale package.',
        'en-US.ts is the source of truth. Each locale file mirrors its keys, translated into the target language.',
        'Values may contain variable placeholders (${variable}) and bracketed formatters ([number], [percent], [percent0to2dp], [date], [time], [datetime]); these must be preserved verbatim.',
        'Date/time format strings must keep the same component order and punctuation style while translating the component letters.',
        'Review ONLY the changed lines shown in the diffs, using en-US.ts for context.',
        'Flag: mistranslations or wrong meaning; altered, missing, or mistranslated placeholders/formatters; inappropriate tone or register for product UI / screen-reader text; obviously unnatural phrasing.',
        'Do NOT flag stylistic preferences where the translation is correct, or anything outside the changed lines.',
        'Output concise GitHub-flavoured Markdown. If nothing is concerning across all locales, respond with a single line stating translations look correct. Otherwise, add a `### <locale>` section ONLY for locales that have issues, each finding as a bullet citing the key; then end with one line listing all the locales with no issues together, e.g. "No issues found in: de-DE, fr-FR, ja-JP." Never give a clean locale its own heading.',
    ].join('\n');

    const userText = `## en-US.ts (source of truth, for context)\n\n\`\`\`typescript\n${enUs}\n\`\`\`\n\n## Changed translations to review\n\n${diffs}`;

    const review = await callAnthropic(apiKey, system, userText);

    const report = [
        '<!-- l10n-translation-review -->',
        '## 🌐 Translation review (advisory)',
        '',
        `Semantic review of changed translations in \`${SRC_DIR}\` against \`en-US.ts\`. This is advisory — structural completeness (matching key sets) is enforced by the package's \`translations\` test.`,
        '',
        review,
        '',
        '---',
        `<sub>Reviewed ${files.length} locale file(s) with ${MODEL}. Generated by \`tools/l10n/review-translations.mjs\`.</sub>`,
    ].join('\n');

    writeFileSync(REPORT_PATH, report);
    console.log(`Wrote review to ${REPORT_PATH}`);
}

main().catch((err) => {
    // Advisory job — log and exit 0 so the build is never blocked.
    console.error('Translation review failed:', err.message);
    process.exit(0);
});
