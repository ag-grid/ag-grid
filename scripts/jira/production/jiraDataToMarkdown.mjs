/*
 * Transform the Jira changelog / pipeline JSON (as produced by getChangelog.js /
 * getPipeline.js) into an LLM-friendly markdown document, served on the website as
 * /changelog.md and /pipeline.md.
 *
 * Zero dependencies (Node built-ins only) so it runs under the same bare Node the
 * other jira_reports scripts use on production - no npm install required. Written as
 * an ES module (.mjs) so the Astro endpoints (changelog.md.ts / pipeline.md.ts) can
 * import it directly under Vite; Node runs .mjs natively, so the production cron and
 * dev/build share one transform and cannot drift.
 *
 * CLI: node jiraDataToMarkdown.mjs <changelog|pipeline> <input.json> <output.md> [product]
 * where [product] is the product name used in headings (default "AG Grid"), e.g.
 * "AG Charts" or "AG Studio".
 */
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

// Only x.y or x.y.z version strings are treated as releases; buckets like "Ideas"
// or "Out of scope" that appear in the pipeline are sorted separately.
const SEMVER = /^\d+\.\d+(?:\.\d+)?$/;
const UNVERSIONED = 'Unversioned';
const TABLE_HEADERS = ['Issue', 'Type', 'Summary'];
const DEFAULT_PRODUCT = 'AG Grid';
// Site the frontmatter's llms.txt link points at. Hard-coded because this module stays
// dependency-free for the production cron, which rules out reading the site's constants.
const DEFAULT_SITE_URL = 'https://www.ag-grid.com';

/** Flatten a Jira rich-text HTML fragment to a single line of readable plain text. */
export function htmlToText(html) {
    if (!html) {
        return '';
    }
    return (
        String(html)
            .replace(/<\/(?:p|li|ul|ol|div|tr|h[1-6])>/gi, '\n')
            .replace(/<li[^>]*>/gi, '- ')
            .replace(/<br\s*\/?>/gi, '\n')
            // Preserve inline code as markdown backticks before stripping remaining tags.
            .replace(/<\/?code>/gi, '`')
            .replace(/<[^>]+>/g, '')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ')
            // Decode &amp; last so entities like &amp;lt; don't get double-decoded.
            .replace(/&amp;/g, '&')
            .replace(/[ \t]+/g, ' ')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .join(' ')
            .trim()
    );
}

/** Plain text for a markdown table cell (pipes escaped so they don't break the row). */
function escapeCell(text) {
    return htmlToText(text).replace(/\|/g, '\\|');
}

// Match the labels the site's grid shows: Jira "Bug" is a defect, everything else a
// feature request (see issueColDefs.ts).
function issueTypeLabel(issueType) {
    return issueType === 'Bug' ? 'Defect' : 'Feature Request';
}

function primaryVersion(entry) {
    return entry.versions && entry.versions.length ? entry.versions[0] : null;
}

function compareVersionsDesc(a, b) {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        const diff = (pb[i] || 0) - (pa[i] || 0);
        if (diff !== 0) {
            return diff;
        }
    }
    return 0;
}

/*
 * The frontmatter block, matching the one every other markdown twin opens with (see
 * `markdownFrontmatter.ts`). These two pages are generated indexes with no place in the site
 * footer, so they carry no `related` list — the entries they group ARE their related links.
 */
function frontmatter(title, description, product, siteUrl) {
    return [
        '---',
        `product: "${product}"`,
        `title: "${title}"`,
        `description: "${description}"`,
        `llms: "${siteUrl}/llms.txt"`,
        '---',
    ].join('\n');
}

function markdownTable(rows) {
    const lines = [`| ${TABLE_HEADERS.join(' | ')} |`, `| ${TABLE_HEADERS.map(() => '---').join(' | ')} |`];
    for (const row of rows) {
        lines.push(`| ${row.join(' | ')} |`);
    }
    return lines.join('\n');
}

function issueRow(entry) {
    return [entry.key, issueTypeLabel(entry.issueType), escapeCell(entry.summary)];
}

// Join the document sections, dropping empties, with exactly one trailing newline.
function joinSections(sections) {
    return `${sections.filter(Boolean).join('\n\n').trimEnd()}\n`;
}

/* ------------------------------------------------------------------ changelog */

function versionHeading(version) {
    return version === UNVERSIONED ? UNVERSIONED : version;
}

// Version keys newest-first: semver releases descending, then any non-semver buckets
// alphabetically, then the unversioned bucket last.
function sortedVersionKeys(groups) {
    const keys = Array.from(groups.keys()).filter((key) => key !== UNVERSIONED);
    const releases = keys.filter((key) => SEMVER.test(key)).sort(compareVersionsDesc);
    const others = keys.filter((key) => !SEMVER.test(key)).sort();
    const ordered = releases.concat(others);
    if (groups.has(UNVERSIONED)) {
        ordered.push(UNVERSIONED);
    }
    return ordered;
}

function groupByVersion(entries) {
    const groups = new Map();
    for (const entry of entries) {
        const key = primaryVersion(entry) || UNVERSIONED;
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key).push(entry);
    }
    return groups;
}

function noteBullet(entry, field) {
    const summary = htmlToText(entry.summary);
    const notes = htmlToText(entry[field]);
    const detail = notes ? `: ${notes}` : '';
    const docLink = entry.documentationUrl ? ` ([docs](${entry.documentationUrl}))` : '';
    return `- **${entry.key}** - ${summary}${detail}${docLink}`;
}

// A lead section (Breaking Changes / Deprecations) listing every entry carrying the
// given notes field, grouped by release so the JIRAs are grep-able across versions.
function notesSection(title, intro, versionKeys, groups, field) {
    const blocks = [`## ${title}`, intro];
    let found = false;
    for (const version of versionKeys) {
        const items = groups.get(version).filter((entry) => entry[field]);
        if (!items.length) {
            continue;
        }
        found = true;
        blocks.push(`### ${versionHeading(version)}`);
        blocks.push(items.map((entry) => noteBullet(entry, field)).join('\n'));
    }
    if (!found) {
        blocks.push('_None recorded._');
    }
    return blocks.join('\n\n');
}

function allChangesSection(versionKeys, groups) {
    const blocks = ['## All Changes', 'Every changelog entry, grouped by release.'];
    for (const version of versionKeys) {
        blocks.push(`### ${versionHeading(version)}`);
        blocks.push(markdownTable(groups.get(version).map(issueRow)));
    }
    return blocks.join('\n\n');
}

export function changelogToMarkdown(entries, product = DEFAULT_PRODUCT, siteUrl = DEFAULT_SITE_URL) {
    const groups = groupByVersion(entries);
    const versionKeys = sortedVersionKeys(groups);

    return joinSections([
        frontmatter(
            `${product} Changelog`,
            `Every completed ${product} change by release, with all breaking changes and deprecations listed across releases.`,
            product,
            siteUrl
        ),
        `# ${product} Changelog`,
        `Completed ${product} changes, newest release first. The Breaking Changes and Deprecations sections collect those items across every release; All Changes lists every entry.`,
        notesSection(
            'Breaking Changes',
            'Breaking changes across all releases, newest first.',
            versionKeys,
            groups,
            'breakingChangesNotes'
        ),
        notesSection(
            'Deprecations',
            'Deprecations across all releases, newest first.',
            versionKeys,
            groups,
            'deprecationNotes'
        ),
        allChangesSection(versionKeys, groups),
    ]);
}

/* ------------------------------------------------------------------- pipeline */

// The site derives the pipeline status from the fix version rather than the Jira
// status (see Pipeline.tsx): the latest fix version "NEXT" means the next release,
// any other version is that scheduled release, and no version means Backlog.
function pipelineStatus(entry) {
    const versions = entry.versions || [];
    if (!versions.length) {
        return 'Backlog';
    }
    const latest = versions[versions.length - 1];
    return latest.toUpperCase() === 'NEXT' ? 'Scheduled' : `Scheduled for ${latest}`;
}

function scheduledVersion(group) {
    return group.replace('Scheduled for ', '');
}

// Group order: the next release ("Scheduled") first, then scheduled releases newest
// first, then non-version buckets (e.g. "Ideas") alphabetically, then Backlog last.
function pipelineGroupRank(group) {
    if (group === 'Scheduled') {
        return 0;
    }
    if (group === 'Backlog') {
        return 3;
    }
    return SEMVER.test(scheduledVersion(group)) ? 1 : 2;
}

function comparePipelineGroups(a, b) {
    const rankDiff = pipelineGroupRank(a) - pipelineGroupRank(b);
    if (rankDiff !== 0) {
        return rankDiff;
    }
    if (pipelineGroupRank(a) === 1) {
        return compareVersionsDesc(scheduledVersion(a), scheduledVersion(b));
    }
    return a.localeCompare(b);
}

export function pipelineToMarkdown(entries, product = DEFAULT_PRODUCT, siteUrl = DEFAULT_SITE_URL) {
    const groups = new Map();
    for (const entry of entries) {
        const key = pipelineStatus(entry);
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key).push(entry);
    }
    const groupKeys = Array.from(groups.keys()).sort(comparePipelineGroups);

    const sections = [
        frontmatter(
            `${product} Pipeline`,
            `Feature requests and active bugs in the ${product} backlog, grouped by their scheduled release.`,
            product,
            siteUrl
        ),
        `# ${product} Pipeline`,
        `Feature requests and active bugs in the ${product} backlog, grouped by scheduled release. Items scheduled for the next release appear under "Scheduled"; unscheduled items under "Backlog".`,
    ];
    for (const key of groupKeys) {
        sections.push(`## ${key}`);
        sections.push(markdownTable(groups.get(key).map(issueRow)));
    }
    return joinSections(sections);
}

/* ------------------------------------------------------------------------ cli */

function runCli(args) {
    const [kind, inputPath, outputPath, product = DEFAULT_PRODUCT, siteUrl = DEFAULT_SITE_URL] = args;
    if (!kind || !inputPath || !outputPath) {
        console.error(
            'Usage: node jiraDataToMarkdown.mjs <changelog|pipeline> <input.json> <output.md> [product] [siteUrl]'
        );
        process.exit(1);
    }
    const transform = kind === 'changelog' ? changelogToMarkdown : kind === 'pipeline' ? pipelineToMarkdown : null;
    if (!transform) {
        console.error(`Unknown kind "${kind}" (expected "changelog" or "pipeline")`);
        process.exit(1);
    }
    const entries = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
    fs.writeFileSync(outputPath, transform(entries, product, siteUrl), 'utf-8');
    console.log(`Wrote ${kind} markdown (${entries.length} entries) to ${outputPath}`);
}

// Run the CLI only when invoked directly (node jiraDataToMarkdown.mjs …), not on import.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    runCli(process.argv.slice(2));
}
