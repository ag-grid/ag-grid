#!/usr/bin/env node
// One-off migration of the .htaccess an ALREADY-DEPLOYED documentation archive carries. Archives
// are never rebuilt, so fixes to the archive .htaccess generators never reach the versions
// deployed before them; this patches those files in place to the same behaviour.
//
//   node scripts/migrate-archive-htaccess.mjs <file> --site grid|charts|studio --base /archive/36.2.0 [--check]
//
// What it changes (see scripts/deployments/prep_and_archive/migrateDeployedArchiveHtaccess.sh for
// how it is run against the hosts):
//
// - Inserts one marker-delimited block straight after the file's first `RewriteEngine On`, so it
//   runs before every rule the archive already has. It sends each alias host (the apex, blog. and
//   the legacy hosts) to the same archive URL on www in one hop. An archive's own rewrite block
//   replaces its parents', so no parent rule does this; and the grid 36.x rules that try drop the
//   /archive/<v>/ prefix, landing on the current docs. A file with no rewrite block gets a block
//   of its own. For grid it also carries the http -> https upgrade, replacing the one it removes.
//   No [NE]: %{REQUEST_URI} is decoded, so it has to be re-escaped on the way out (with [NE], %20
//   went out as a raw space and %2541 as %41 - a different URL; verified on Apache 2.4).
// - When a grid archive serves markdown twins but negotiates them root-anchored (which never
//   matches under /archive/<v>/), the block also negotiates them under the archive's own base.
// - Removes the rules a grid archive inherited from the live-site generator that send a request
//   OUT of the archive: the single-hop rewrites and their host skip, the /charts/ rules, the blog
//   host block, the prefix-dropping host and index.php rules, the partnership tracker, and every
//   generated redirect whose target is a live (or external) URL on a host the redirect lists use.
//
// It is conservative by construction: every rewrite rule and redirect in the file must match a
// shape one of the generators is known to have emitted, each with a fixed keep/remove decision.
// A file with anything else is refused and left untouched, as is one that names another archive
// version or does not look generated at all. Headers are left alone - the root .htaccess already
// applies the archive header fixes, and mod_headers rules (unlike mod_rewrite) are inherited -
// except the Vary: Accept that has to go with any negotiation the block adds.
//
// Idempotent: a re-run replaces the marked block and finds nothing left to remove, so the output
// is byte-identical. The core is a pure function, exported for the tests.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const MIGRATION_BEGIN = '# BEGIN archive migration (do not edit)';
export const MIGRATION_END = '# END archive migration';

// The hosts the live grid generator canonicalises onto www (getModRewriteRules in
// documentation/ag-grid-docs/src/utils/htaccess/htaccessRules.ts). A test holds the two together.
export const ALIAS_HOSTS = [
    'ag-grid.com',
    'blog.ag-grid.com',
    'angulargrid.ag-grid.com',
    'angular-grid.ag-grid.com',
    'javascript-grid.ag-grid.com',
    'react-grid.ag-grid.com',
    'angulargrid.com',
    'www.angulargrid.com',
];

const CANONICAL_ORIGIN = 'https://www.ag-grid.com';

export const SITES = {
    grid: /^\/archive\/\d+\.\d+\.\d+$/,
    charts: /^\/charts\/archive\/\d+\.\d+\.\d+$/,
    studio: /^\/studio\/archive\/\d+\.\d+\.\d+$/,
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const escapeDots = (text) => text.replace(/\./g, '\\.');

/**
 * Splits a directive's arguments as Apache does: whitespace separates them, double or single
 * quotes group them, and a backslash before the same quote is the only escape removed.
 */
function tokenize(line) {
    const tokens = [];
    let i = 0;
    while (i < line.length) {
        while (i < line.length && /\s/.test(line[i])) {
            i++;
        }
        if (i >= line.length) {
            break;
        }
        let token = '';
        const quote = line[i];
        if (quote === '"' || quote === "'") {
            i++;
            while (i < line.length && line[i] !== quote) {
                if (line[i] === '\\' && line[i + 1] === quote) {
                    i++;
                }
                token += line[i++];
            }
            i++;
        } else {
            while (i < line.length && !/\s/.test(line[i])) {
                if (line[i] === '\\' && line[i + 1] === ' ') {
                    token += line[i++];
                }
                token += line[i++];
            }
        }
        tokens.push(token);
    }
    return tokens;
}

// Where a redirect target goes, relative to this archive. A fragment does not change that.
function targetScope(target, base) {
    const path = target.split('#')[0];
    if (/^https?:\/\//i.test(path)) {
        return path === `${CANONICAL_ORIGIN}${base}` || path.startsWith(`${CANONICAL_ORIGIN}${base}/`)
            ? 'inside'
            : 'outside';
    }
    if (path.startsWith('/')) {
        return path === base || path.startsWith(`${base}/`) ? 'inside' : 'outside';
    }
    return 'unknown';
}

// The hosts any version of the grid redirect list (documentation/ag-grid-docs/src/utils/htaccess/
// redirects.ts) has pointed an absolute target at. A redirect to any other host was not generated.
const GENERATED_REDIRECT_HOSTS = [
    'www.ag-grid.com',
    'ag-grid.com',
    'blog.ag-grid.com',
    'charts.ag-grid.com',
    'medium.com',
    'epicmax.co',
];

// The hosts the rewrite rules of any version of the grid generator (htaccessRules.ts) send a
// request to: the live site, and one blog post that moved to its author's site.
const GENERATED_REWRITE_HOSTS = ['www.ag-grid.com', 'epicmax.co'];

// The host of an absolute https target, or undefined for anything else.
const httpsHost = (target) => target.match(/^https:\/\/([^/?#%]+)(?:[/?#%]|$)/)?.[1];

// The four .well-known exclusions the grid generator puts on its https and index.php rules. Under
// /archive/<v>/ they can never match, so they carry no meaning of their own here.
const WELL_KNOWN_CONDS = [
    String.raw`%{REQUEST_URI} !^/\.well-known/acme-challenge/[0-9a-zA-Z_-]+$`,
    String.raw`%{REQUEST_URI} !^/\.well-known/cpanel-dcv/[0-9a-zA-Z_-]+$`,
    String.raw`%{REQUEST_URI} !^/\.well-known/pki-validation/[A-F0-9]{32}\.txt(?:\ Comodo\ DCV)?$`,
    String.raw`%{REQUEST_URI} !^/\.well-known/pki-validation/(?:\ Ballot169)?`,
];

const condText = (cond) => cond.args.join(' ');
const sameConds = (group, expected) =>
    group.conds.length === expected.length && group.conds.every((cond, i) => condText(cond) === expected[i]);

const HOST_COND = /^%\{HTTP_HOST\} \^((?:[a-z0-9-]+\\\.)+[a-z]+)\$(?: \[(?:NC|OR|NC,OR)\])?$/;

// The hosts a group's conditions select, when they are nothing but alias-host tests (OR-ed, or a
// single one); otherwise null.
function aliasHostsOf(group) {
    if (!group.conds.length) {
        return null;
    }
    const hosts = [];
    for (const [i, cond] of group.conds.entries()) {
        const m = condText(cond).match(HOST_COND);
        const last = i === group.conds.length - 1;
        if (!m || (!last && !/\bOR\]$/.test(condText(cond))) || (last && /\bOR\]$/.test(condText(cond)))) {
            return null;
        }
        const host = m[1].replace(/\\\./g, '.');
        if (!ALIAS_HOSTS.includes(host)) {
            return null;
        }
        hosts.push(host);
    }
    return hosts;
}

/**
 * The rewrite-rule shapes the archive generators have emitted, each with a fixed decision. A
 * group is a RewriteRule with the RewriteConds before it. Matched in order; the first wins.
 * `classify` returns { action: 'keep' | 'remove', reason } or null when the shape is not its own.
 */
function rewriteRecognisers(base) {
    const baseRel = base.slice(1);
    const baseAwareCapture = (pattern) =>
        pattern.startsWith(`^/(${baseRel}/`) || pattern.startsWith(`^/(${escapeDots(baseRel)}/`);
    const baseRoot = (pattern) =>
        [`^${base}/?$`, `^${escapeDots(base)}/?$`, `^${base}/$`, `^${escapeDots(base)}/$`].includes(pattern);

    return [
        {
            // RewriteCond %{HTTP_HOST} !^(www\.)?ag-grid\.com$ [NC] / RewriteRule ^ - [S=n]
            name: 'host skip',
            classify: (group) => {
                const m = group.rule.args.join(' ').match(/^\^ - \[S=(\d+)\]$/);
                if (!m || !sameConds(group, [String.raw`%{HTTP_HOST} !^(www\.)?ag-grid\.com$ [NC]`])) {
                    return null;
                }
                // Whether it goes depends on the rules it skips, which are checked once all are classified.
                return { action: 'skip', count: Number(m[1]), reason: 'host skip over the single-hop rewrites' };
            },
        },
        {
            // SE-64/SE-66 single-hop rewrites and the live /charts/ rules: a quoted pattern and an
            // absolute target. The archive-aware generator points them inside the archive.
            name: 'single-hop rewrite',
            classify: (group) => {
                const [pattern, target, flags, ...rest] = group.rule.args;
                if (
                    rest.length ||
                    !group.rule.quotedPattern ||
                    !pattern.startsWith('^/?') ||
                    !/^https:\/\//.test(target) ||
                    !/^\[R=301,(?:NE,)?L\]$/.test(flags ?? '')
                ) {
                    return null;
                }
                const condsOk = group.conds.length === 0 || sameConds(group, ['%{REQUEST_URI} /+[^.]+$']);
                if (!condsOk) {
                    return null;
                }
                if (targetScope(target, base) === 'inside') {
                    return { action: 'keep', reason: 'single-hop rewrite inside the archive' };
                }
                // The generator only ever pointed these at the live site.
                return httpsHost(target) !== 'www.ag-grid.com'
                    ? null
                    : {
                          action: 'remove',
                          reason:
                              pattern.startsWith('^/?charts/') || pattern.startsWith('^/?(charts/')
                                  ? 'live /charts/ rewrite'
                                  : 'single-hop rewrite to the live site',
                      };
            },
        },
        {
            // Always use https: www/apex on port 80.
            name: 'https upgrade',
            classify: (group) => {
                const [pattern, target, flags] = group.rule.args;
                if (
                    pattern !== '^(.*)$' ||
                    flags !== '[R=301,L]' ||
                    !sameConds(group, [
                        String.raw`%{HTTP_HOST} ^(www\.)?ag-grid\.com$ [NC]`,
                        '%{SERVER_PORT} 80',
                        ...WELL_KNOWN_CONDS,
                    ])
                ) {
                    return null;
                }
                if (target === `${CANONICAL_ORIGIN}%{REQUEST_URI}`) {
                    return { action: 'keep', reason: 'https upgrade keeping the path' };
                }
                return target === `${CANONICAL_ORIGIN}/$1`
                    ? { action: 'remove', reason: 'https upgrade dropping the archive prefix' }
                    : null;
            },
        },
        {
            // Alias host -> www, and the blog catch-all of the live generator.
            name: 'host canonicalisation',
            classify: (group) => {
                const [pattern, target, flags, ...rest] = group.rule.args;
                const hosts = aliasHostsOf(group);
                if (!hosts || rest.length || !['^', '^(.*)$', '^/?(.*)$'].includes(pattern)) {
                    return null;
                }
                if (!/^\[R=301,(?:NC,)?L\]$/.test(flags ?? '')) {
                    return null;
                }
                if (target === `${CANONICAL_ORIGIN}%{REQUEST_URI}`) {
                    return { action: 'keep', reason: 'host canonicalisation keeping the path', hosts };
                }
                if (target === `${CANONICAL_ORIGIN}/$1`) {
                    return { action: 'remove', reason: 'host canonicalisation dropping the archive prefix' };
                }
                if (
                    hosts.length === 1 &&
                    hosts[0] === 'blog.ag-grid.com' &&
                    targetScope(target, base) === 'outside' &&
                    httpsHost(target) === 'www.ag-grid.com'
                ) {
                    return { action: 'remove', reason: 'blog host redirect to the live blog' };
                }
                return null;
            },
        },
        {
            // The blog.ag-grid.com migration map: host-scoped redirects to live URLs and 410s.
            name: 'blog host rule',
            classify: (group) => {
                const [, target, flags, ...rest] = group.rule.args;
                if (rest.length || !sameConds(group, [String.raw`%{HTTP_HOST} ^blog\.ag-grid\.com$ [NC]`])) {
                    return null;
                }
                if (target === '-' && flags === '[R=410,NC,L]') {
                    return { action: 'remove', reason: 'blog host rule (410)' };
                }
                if (
                    flags === '[R=301,NC,L]' &&
                    GENERATED_REWRITE_HOSTS.includes(httpsHost(target)) &&
                    targetScope(target, base) === 'outside'
                ) {
                    return { action: 'remove', reason: 'blog host redirect to the live blog' };
                }
                return null;
            },
        },
        {
            // SE-80 markdown negotiation, page twins.
            name: 'markdown negotiation',
            classify: (group) => {
                const [pattern, target, flags, ...rest] = group.rule.args;
                if (
                    rest.length ||
                    pattern !== '^' ||
                    target !== '/%1.md' ||
                    flags !== '[L]' ||
                    group.conds.length !== 3
                ) {
                    return null;
                }
                const [accept, uri, file] = group.conds.map(condText);
                const uriPattern = group.conds[1].args[1];
                if (
                    accept !== '%{HTTP_ACCEPT} text/markdown' ||
                    !uri.startsWith('%{REQUEST_URI} ^/(') ||
                    group.conds[1].args.length !== 2 ||
                    file !== '%{DOCUMENT_ROOT}/%1.md -f'
                ) {
                    return null;
                }
                return baseAwareCapture(uriPattern)
                    ? { action: 'keep', reason: 'markdown negotiation under the archive', negotiates: true }
                    : { action: 'keep', reason: 'root-anchored markdown negotiation (never matches here)' };
            },
        },
        {
            // SE-80 markdown negotiation, homepage twin.
            name: 'markdown homepage negotiation',
            classify: (group) => {
                const [pattern, target, flags, ...rest] = group.rule.args;
                if (rest.length || pattern !== '^' || flags !== '[L]' || group.conds.length !== 3) {
                    return null;
                }
                const [accept, , file] = group.conds.map(condText);
                const uriArgs = group.conds[1].args;
                if (
                    accept !== '%{HTTP_ACCEPT} text/markdown' ||
                    uriArgs[0] !== '%{REQUEST_URI}' ||
                    uriArgs.length !== 2
                ) {
                    return null;
                }
                if (uriArgs[1] === '^/$' && file === '%{DOCUMENT_ROOT}/index.md -f' && target === '/index.md') {
                    return { action: 'keep', reason: 'root-anchored markdown negotiation (never matches here)' };
                }
                if (
                    baseRoot(uriArgs[1]) &&
                    file === `%{DOCUMENT_ROOT}${base}/index.md -f` &&
                    target === `${base}/index.md`
                ) {
                    return { action: 'keep', reason: 'markdown negotiation under the archive' };
                }
                return null;
            },
        },
        {
            // Remove "index.php" from URLs.
            name: 'index.php',
            classify: (group) => {
                const [pattern, target, flags, ...rest] = group.rule.args;
                if (rest.length || flags !== '[R=301,L]' || !sameConds(group, WELL_KNOWN_CONDS)) {
                    return null;
                }
                const expected = { '^index\\.php$': ['/', `${base}/`], '^(.*)/index\\.php$': ['/$1/', `${base}/$1/`] }[
                    pattern
                ];
                if (!expected) {
                    return null;
                }
                if (target === expected[1]) {
                    return { action: 'keep', reason: 'index.php redirect inside the archive' };
                }
                return target === expected[0]
                    ? { action: 'remove', reason: 'index.php redirect out of the archive' }
                    : null;
            },
        },
        {
            // Redirect paths after a php file.
            name: 'php path',
            classify: (group) => {
                const [pattern, target, flags, ...rest] = group.rule.args;
                if (rest.length || group.conds.length || pattern !== '^(.*)\\.php(\\/.+)$' || flags !== '[R=301,L]') {
                    return null;
                }
                if (target === `${base}/$1.php`) {
                    return { action: 'keep', reason: 'php path redirect inside the archive' };
                }
                return target === '/$1.php'
                    ? { action: 'remove', reason: 'php path redirect out of the archive' }
                    : null;
            },
        },
        {
            // Add trailing slash for directories: %{REQUEST_URI} keeps the prefix.
            name: 'trailing slash',
            classify: (group) =>
                group.rule.args.join(' ') === '^(.+[^/])$ %{REQUEST_URI}/ [R=301,L]' &&
                sameConds(group, [String.raw`%{REQUEST_URI} /+[^\.]+$`])
                    ? { action: 'keep', reason: 'trailing-slash redirect' }
                    : null,
        },
    ];
}

// The partnership tracker the live grid generator emits verbatim, and archive builds now leave out.
const PARTNERSHIP_REDIRECT = 'RedirectMatch 302 ^/theo/$ https://www.ag-grid.com/';

/**
 * The mod_alias redirects, by the exact forms the generators have emitted: `Redirect 301 <from>
 * <to>` and `Redirect 410 <from>` unquoted, `RedirectMatch 301 "<pattern>" "<to>"` and
 * `RedirectMatch 410 "<pattern>"` quoted, and the partnership tracker verbatim. One landing inside
 * the archive is kept; one leaving it is removed only when its target is an absolute https URL on a
 * host the redirect lists have used. Anything else - another status, other quoting, a root-relative
 * target outside the archive, an unknown host - is not a generated shape, so it is never deleted.
 */
function classifyAlias(line, base) {
    if (line === PARTNERSHIP_REDIRECT) {
        return { action: 'remove', reason: 'partnership tracker redirect to the live site' };
    }
    const m =
        line.match(/^(Redirect) (301|410) ([^\s"']+)(?: ([^\s"']+))?$/) ??
        line.match(/^(RedirectMatch) (301|410) "([^"]+)"(?: "([^"]+)")?$/);
    if (!m) {
        return null;
    }
    const [, directive, status, from, to] = m;
    // A Redirect is a prefix match on the full path, so one that does not start with the base
    // could never fire in this directory. No generator emits that, so it is not a known shape.
    if (directive === 'Redirect' && from !== base && !from.startsWith(`${base}/`)) {
        return null;
    }
    if (status === '410') {
        return to === undefined ? { action: 'keep', reason: 'gone (410)' } : null;
    }
    if (to === undefined) {
        return null;
    }
    const scope = targetScope(to, base);
    if (scope === 'inside') {
        return { action: 'keep', reason: 'redirect inside the archive' };
    }
    return scope === 'outside' && GENERATED_REDIRECT_HOSTS.includes(httpsHost(to))
        ? { action: 'remove', reason: 'redirect to a live or external URL' }
        : null;
}

// The base-aware markdown negotiation for an archive that serves twins but cannot negotiate them.
// Generic rather than the page registry: an archive is frozen with whatever pages its version had,
// which the current registry does not describe, and the -f guard means a path is only ever
// rewritten to a twin that exists on disk - so a generic path shape can only add pages, never
// serve something that is not a twin. A path segment with a dot (a file) is never negotiated.
function markdownRules(base) {
    const pattern = escapeDots(base);
    const rel = escapeDots(base.slice(1));
    return [
        '    # Markdown twins on Accept: text/markdown, under this archive (its own rules are root-anchored).',
        '    RewriteCond %{HTTP_ACCEPT} text/markdown',
        `    RewriteCond %{REQUEST_URI} ^/(${rel}/(?:[^/.]+/)*[^/.]+)/?$`,
        '    RewriteCond %{DOCUMENT_ROOT}/%1.md -f',
        '    RewriteRule ^ /%1.md [L]',
        '    RewriteCond %{HTTP_ACCEPT} text/markdown',
        `    RewriteCond %{REQUEST_URI} ^${pattern}/$`,
        `    RewriteCond %{DOCUMENT_ROOT}${base}/index.md -f`,
        `    RewriteRule ^ ${base}/index.md [L]`,
        '    # The HTML variant negotiates too, so shared caches must key on Accept. Matches the',
        '    # DirectoryIndex form (<page>/index.html) as well, which is what REQUEST_URI is by then.',
        `    <If "%{REQUEST_URI} =~ m#^${pattern}/(?:(?:[^/.]+/)*[^/.]+/?)?(?:index\\.html)?$#">`,
        '        Header append Vary Accept',
        '    </If>',
    ];
}

function buildBlock({ site, base, markdown, standalone }) {
    const hostConds = ALIAS_HOSTS.map(
        (host, i) =>
            `    RewriteCond %{HTTP_HOST} ^${escapeRegex(host)}$ [${i < ALIAS_HOSTS.length - 1 ? 'NC,OR' : 'NC'}]`
    );
    const rules = [
        '    # Added to this already-deployed archive by scripts/migrate-archive-htaccess.mjs; a re-run',
        '    # replaces it. Runs before every other rule here, and keeps the full archive path.',
        ...(site === 'grid'
            ? [
                  String.raw`    RewriteCond %{HTTP_HOST} ^(www\.)?ag-grid\.com$ [NC]`,
                  '    RewriteCond %{SERVER_PORT} 80',
                  `    RewriteRule ^ ${CANONICAL_ORIGIN}%{REQUEST_URI} [R=301,L]`,
              ]
            : []),
        ...hostConds,
        `    RewriteRule ^ ${CANONICAL_ORIGIN}%{REQUEST_URI} [R=301,L]`,
        ...(markdown ? markdownRules(base) : []),
    ];
    if (standalone) {
        return [
            MIGRATION_BEGIN,
            '<IfModule mod_rewrite.c>',
            '    RewriteEngine On',
            ...rules,
            '</IfModule>',
            MIGRATION_END,
        ];
    }
    return [`    ${MIGRATION_BEGIN}`, ...rules, `    ${MIGRATION_END}`];
}

/**
 * The lines left once `removeLines` go. A comment directly above a removed directive (no blank
 * line between) describes it, so it goes too; and a run of blank lines that a removal leaves
 * behind collapses to one. Blank runs elsewhere are untouched.
 */
function withoutRemoved(lines, removeLines) {
    const drop = new Set(removeLines);
    let comments = 0;
    for (const i of [...removeLines].sort((a, b) => a - b)) {
        for (let j = i - 1; j >= 0 && !drop.has(j) && lines[j].trim().startsWith('#'); j--) {
            drop.add(j);
            comments++;
        }
    }
    const kept = [];
    let removedSinceText = false;
    for (const [i, line] of lines.entries()) {
        if (drop.has(i)) {
            removedSinceText = true;
            continue;
        }
        const blank = !line.trim();
        if (blank && removedSinceText && kept.length && !kept[kept.length - 1].trim()) {
            continue;
        }
        if (!blank) {
            removedSinceText = false;
        }
        kept.push(line);
    }
    return { kept, comments };
}

const refuse = (reasons) => ({ status: 'refused', reasons, output: null, removed: [], inserted: [] });

/**
 * Migrates one archive .htaccess. Returns { status: 'patched' | 'unchanged' | 'refused', output,
 * removed: [{ line, text, reason }], inserted: string[], reasons: string[], notes: string[] }.
 * `output` is the new file content (the input itself when unchanged, null when refused).
 */
export function migrateArchiveHtaccess(source, { site, base }) {
    if (!SITES[site]) {
        throw new Error(`Unknown site '${site}' (grid, charts or studio)`);
    }
    if (!SITES[site].test(base)) {
        throw new Error(
            `'${base}' is not a ${site} archive base, e.g. ${{ grid: '/archive/36.2.0', charts: '/charts/archive/14.2.0', studio: '/studio/archive/3.0.0' }[site]}`
        );
    }
    if (!source.startsWith('### AUTOGENERATED DO NOT EDIT\n') || !/^ErrorDocument 404 /m.test(source)) {
        return refuse(['not a generated archive .htaccess (no AUTOGENERATED header or ErrorDocument)']);
    }

    // Every archive path the file names must be this archive's - a file copied into the wrong
    // version directory would otherwise be "fixed" to redirect within the wrong version.
    const version = base.split('/').pop();
    const otherVersions = new Set();
    for (const m of source.matchAll(/archive\/(\d+(?:\\?\.\d+){2})(?=[/$?)"\\]|$)/gm)) {
        const named = m[1].replace(/\\/g, '');
        if (named !== version) {
            otherVersions.add(named);
        }
    }
    if (otherVersions.size) {
        return refuse([`names another archive version (${[...otherVersions].join(', ')}), not ${version}`]);
    }

    const lines = source.split('\n');

    // Take out a previous run's block, so it is regenerated rather than analysed.
    const begins = lines.flatMap((l, i) => (l.trim() === MIGRATION_BEGIN ? [i] : []));
    const ends = lines.flatMap((l, i) => (l.trim() === MIGRATION_END ? [i] : []));
    if (
        begins.length > 1 ||
        ends.length > 1 ||
        begins.length !== ends.length ||
        (begins.length && ends[0] < begins[0])
    ) {
        return refuse(['malformed archive migration markers']);
    }
    const hadBlock = begins.length === 1;
    // A block of its own (markers at the start of the line) was added with a blank line after it.
    const blockEnd =
        hadBlock && lines[begins[0]] === MIGRATION_BEGIN && lines[ends[0] + 1] === '' ? ends[0] + 1 : ends[0];
    const working = hadBlock ? [...lines.slice(0, begins[0]), ...lines.slice(blockEnd + 1)] : lines;

    // Parse the rewrite and alias directives, tracking <IfModule mod_rewrite.c>.
    const recognisers = rewriteRecognisers(base);
    const unknown = [];
    const groups = [];
    const aliasDecisions = [];
    let pendingConds = [];
    let inRewriteModule = false;
    let firstEngine = -1;
    for (const [i, raw] of working.entries()) {
        const line = raw.trim();
        if (!line || line.startsWith('#')) {
            continue;
        }
        const [directive, ...args] = tokenize(line);
        if (directive === '<IfModule' && /^mod_rewrite\.c>$/.test(args.join(' '))) {
            inRewriteModule = true;
            continue;
        }
        if (directive === '</IfModule>' && inRewriteModule) {
            if (pendingConds.length) {
                unknown.push(`line ${i + 1}: RewriteCond with no RewriteRule after it`);
                pendingConds = [];
            }
            inRewriteModule = false;
            continue;
        }
        if (/^Rewrite/.test(directive)) {
            if (!inRewriteModule) {
                unknown.push(`line ${i + 1}: ${directive} outside <IfModule mod_rewrite.c>: ${line}`);
                continue;
            }
            if (directive === 'RewriteEngine') {
                if (args.length !== 1 || args[0] !== 'On' || pendingConds.length) {
                    unknown.push(`line ${i + 1}: ${line}`);
                } else if (firstEngine < 0) {
                    firstEngine = i;
                }
            } else if (directive === 'RewriteCond') {
                pendingConds.push({ line: i, args });
            } else if (directive === 'RewriteRule') {
                const rest = raw.trim().slice('RewriteRule'.length).trimStart();
                groups.push({ conds: pendingConds, rule: { line: i, args, quotedPattern: rest.startsWith('"') } });
                pendingConds = [];
            } else {
                // RewriteBase, RewriteOptions, RewriteMap...: no generator emits them.
                unknown.push(`line ${i + 1}: ${line}`);
            }
            continue;
        }
        if (pendingConds.length) {
            unknown.push(`line ${i + 1}: RewriteCond not followed by its RewriteRule`);
            pendingConds = [];
        }
        if (/^Redirect/.test(directive)) {
            // RedirectPermanent, RedirectTemp: no generator emits them.
            const decision = ['Redirect', 'RedirectMatch'].includes(directive) ? classifyAlias(line, base) : null;
            if (!decision) {
                unknown.push(`line ${i + 1}: ${line}`);
            } else {
                aliasDecisions.push({ line: i, ...decision });
            }
        }
    }

    for (const group of groups) {
        let decision = null;
        for (const recogniser of recognisers) {
            const found = recogniser.classify(group);
            if (found) {
                decision = { ...found, shape: recogniser.name };
                break;
            }
        }
        if (!decision) {
            unknown.push(`line ${group.rule.line + 1}: ${working[group.rule.line].trim()}`);
        }
        group.decision = decision;
    }
    if (unknown.length) {
        return refuse(unknown.map((u) => `unrecognised: ${u}`));
    }

    // A [S=n] skip only goes with the n rules it skips: removing some of them would make it skip
    // rules it was never meant to. The generator emits it over exactly the run of single-hop
    // rewrites that follows it, so anything else means the count is not what it was written for.
    // Then either all n go with it, or it and all n stay.
    for (const [g, group] of groups.entries()) {
        if (group.decision.action !== 'skip') {
            continue;
        }
        const skipped = groups.slice(g + 1, g + 1 + group.decision.count);
        if (skipped.length !== group.decision.count) {
            return refuse([`line ${group.rule.line + 1}: [S=${group.decision.count}] skips past the end of the rules`]);
        }
        const after = groups[g + 1 + group.decision.count];
        if (
            skipped.some((s) => s.decision.shape !== 'single-hop rewrite') ||
            after?.decision.shape === 'single-hop rewrite'
        ) {
            return refuse([
                `line ${group.rule.line + 1}: [S=${group.decision.count}] does not skip exactly the single-hop rewrites after it`,
            ]);
        }
        const actions = new Set(skipped.map((s) => s.decision.action));
        if (actions.size !== 1 || actions.has('skip')) {
            return refuse([
                `line ${group.rule.line + 1}: [S=${group.decision.count}] skips rules that are only partly removed`,
            ]);
        }
        group.decision = { ...group.decision, action: [...actions][0] };
    }

    const removed = [];
    const removeLines = new Set();
    for (const group of groups.filter((g) => g.decision.action === 'remove')) {
        for (const line of [...group.conds.map((c) => c.line), group.rule.line]) {
            removeLines.add(line);
            removed.push({ line: line + 1, text: working[line].trim(), reason: group.decision.reason });
        }
    }
    for (const alias of aliasDecisions.filter((a) => a.action === 'remove')) {
        removeLines.add(alias.line);
        removed.push({ line: alias.line + 1, text: working[alias.line].trim(), reason: alias.reason });
    }
    removed.sort((a, b) => a.line - b.line);

    const notes = [];
    const negotiates = groups.some((g) => g.decision.negotiates);
    const servesMarkdown = /^AddType text\/markdown md$/m.test(source);
    const markdown = site === 'grid' && servesMarkdown && !negotiates;
    if (servesMarkdown && !negotiates && site !== 'grid') {
        // Every charts and studio archive that serves twins negotiates them under its base.
        return refuse(['serves markdown but has no base-aware negotiation, which no charts/studio generator emitted']);
    }
    if (groups.some((g) => g.decision.reason.startsWith('root-anchored'))) {
        notes.push('root-anchored markdown negotiation kept: it never matches under the archive');
    }

    // Generated by an archive-aware generator: nothing leaves the archive, every alias host already
    // keeps the path, and markdown (if any) negotiates under the base. Left exactly as it is.
    const covered = new Set(groups.flatMap((g) => (g.decision.action === 'keep' && g.decision.hosts) || []));
    const httpsKept = site !== 'grid' || groups.some((g) => g.decision.reason === 'https upgrade keeping the path');
    if (!hadBlock && !removed.length && !markdown && httpsKept && ALIAS_HOSTS.every((h) => covered.has(h))) {
        return {
            status: 'unchanged',
            output: source,
            removed,
            inserted: [],
            reasons: [],
            notes: ['already archive-aware: nothing to do'],
            markdown,
            standalone: false,
        };
    }

    const standalone = firstEngine < 0;
    const block = buildBlock({ site, base, markdown, standalone });

    const { kept, comments } = withoutRemoved(working, removeLines);
    if (comments) {
        notes.push(`${comments} comment lines that only described removed rules went with them`);
    }
    let output;
    if (standalone) {
        // No rewrite block of its own yet: add one before the first top-level redirect (or the
        // closing Options), so it reads with the other routing. Position has no effect on order:
        // mod_rewrite always runs before mod_alias.
        let at = kept.findIndex((l) => /^(Redirect|RedirectMatch|Options) /.test(l));
        at = at < 0 ? kept.length : at;
        output = [...kept.slice(0, at), ...block, '', ...kept.slice(at)].join('\n');
        notes.push(
            "no rewrite block of its own: one is added, so the parent directory's rewrite rules no longer apply here"
        );
    } else {
        const engineAfterRemovals = kept.indexOf(working[firstEngine]);
        output = [...kept.slice(0, engineAfterRemovals + 1), ...block, ...kept.slice(engineAfterRemovals + 1)].join(
            '\n'
        );
    }

    const status = output === source ? 'unchanged' : 'patched';
    return { status, output, removed, inserted: block, reasons: [], notes, markdown, standalone };
}

/** A few lines saying what migrateArchiveHtaccess did, for the CLI and the host wrapper. */
export function summarise(result) {
    if (result.status === 'refused') {
        return result.reasons.map((r) => `  ${r}`).join('\n');
    }
    const byReason = new Map();
    for (const r of result.removed) {
        byReason.set(r.reason, (byReason.get(r.reason) ?? 0) + 1);
    }
    const lines = result.inserted.length
        ? [
              `  block: host canonicalisation${result.markdown ? ' + markdown negotiation' : ''}${result.standalone ? ' (in a rewrite block of its own)' : ''}`,
          ]
        : [];
    if (byReason.size) {
        lines.push(`  removed ${result.removed.length} lines:`);
        for (const [reason, count] of byReason) {
            lines.push(`    ${String(count).padStart(5)}  ${reason}`);
        }
    } else {
        lines.push('  removed nothing');
    }
    for (const note of result.notes) {
        lines.push(`  note: ${note}`);
    }
    return lines.join('\n');
}

const USAGE =
    'usage: node scripts/migrate-archive-htaccess.mjs <htaccess> --site grid|charts|studio --base /archive/36.2.0 [--check]';

function main(argv) {
    const args = [...argv];
    const take = (flag) => {
        const i = args.indexOf(flag);
        if (i < 0) {
            return undefined;
        }
        const [, value] = args.splice(i, 2);
        return value;
    };
    const check = args.includes('--check');
    if (check) {
        args.splice(args.indexOf('--check'), 1);
    }
    const site = take('--site');
    const base = take('--base')?.replace(/\/$/, '');
    const [file, ...extra] = args;
    if (!file || !site || !base || extra.length) {
        console.error(USAGE);
        return 2;
    }
    let result;
    try {
        result = migrateArchiveHtaccess(readFileSync(file, 'utf8'), { site, base });
    } catch (e) {
        console.error(`${e.message}\n${USAGE}`);
        return 2;
    }
    const verb = { patched: check ? 'would patch' : 'patched', unchanged: 'unchanged', refused: 'refused' }[
        result.status
    ];
    console.log(`${file}: ${verb} (${site} ${base})`);
    console.log(summarise(result));
    if (result.status === 'refused') {
        return 1;
    }
    if (result.status === 'patched' && !check) {
        writeFileSync(file, result.output);
    }
    return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    process.exit(main(process.argv.slice(2)));
}
