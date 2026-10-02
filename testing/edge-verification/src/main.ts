/**
 * Post-deploy verification of www.ag-grid.com against PRODUCTION: SEO tickets, AI-crawler policy,
 * CloudFront caching and WAF configuration. What the live run checks, by area (`--only <area>`):
 *
 *   redirects      every alias host (apex, blog., react-grid., charts. ..., over http too) and legacy URL
 *                  reaches the right www URL in one hop, query string kept; archive URLs stay inside
 *                  their archive
 *   bot-outcomes   queries recent WAF logs: each crawler/agent family (Googlebot, OAI-SearchBot,
 *                  DuckAssistBot, Meta, LINE ...) is actually allowed, under a non-allowed threshold
 *   headers        Cache-Control per page type (HTML no-cache, archives 7 days, images 1 day), the
 *                  7-day browser-cache cap on every response class (Ghost's uploads and 301s included)
 *                  with nothing left to a heuristic lifetime, Vary: Accept on negotiable HTML, markdown
 *                  negotiation, noindex on archive .md, 304 revalidation, no X-Frame-Options, security
 *                  headers on the blog-host 301, internal hosts noindex, nofollow
 *   crawler-policy robots.txt parsed with an RFC 9309 evaluator: per URL, what search crawlers and the
 *                  AI group may fetch, including each .md twin; the AI group mirrors the * Disallow and
 *                  Allow lines
 *   waf-config     every WAF rule and ACL setting on both ACLs, field by field: order, actions,
 *                  regexes, managed-group overrides, rate limits, logging and redaction, and the
 *                  pending script shapes
 *   cloudfront     distribution, origin and every behaviour field by field; cache/origin-request
 *                  policies, real-time logs, the archive markdown function
 *   seo-content    sample pages: one H1 (and its visible text), <main>, viewport, canonical, absolute
 *                  og:image that loads, structured data (FAQPage only on the home page, its questions
 *                  visible; Organization on all three sites; one Community offer per product; each
 *                  framework's examples), blog links that answer directly, the changelog search page
 *   caching        the live cache: repeat requests hit for cached paths, never for HTML;
 *                  HTML -> markdown -> HTML stays HTML (cache poisoning)
 *   waf-behaviour  real requests: curl gets the guidance 403, curl with Accept: text/markdown gets
 *                  markdown, credential-scanner probes blocked, allowed agents served (Meta on docs and
 *                  the blog too)
 *   migration      migrated archives redirect alias hosts in one hop; .htaccess.bak-* files never served
 *   agent-files    llms.txt and AGENTS.md for all three sites: content type, sections, every
 *                  advertised .md link resolves; the MCP server line, the server card and its npm package
 *   infra          alarms watch the right metric and notify the right topic; Shield protections; ALB
 *                  settings
 *   blog           Ghost blog headers on every page type (one CSP, Referrer/Permissions-Policy, no
 *                  X-Robots-Tag), its sitemap, legacy /blog/ paths, in-post and footer links that answer
 *                  directly, search/newsletter/analytics markup, original publication dates
 *
 * AWS is read-only: the ddos-report-readonly profile is hard-wired, and only allowlisted read calls
 * are made. HTTP is GET/HEAD only, at low volume (a request cap, concurrency and a minimum gap).
 *
 * Verdicts: PASS and FAIL; WARN, a problem that fails only under --strict; KNOWN, an accepted known issue (FIXED? when it no longer reproduces);
 * PENDING, an expectation whose change is not deployed yet (NOW LIVE when it already holds); SKIP,
 * could not be verified (e.g. a denied read, or no request budget left); INFO, reported, not judged.
 * --pending also evaluates the pending expectations (they never fail the run); --strict makes KNOWN
 * and WARN fail the run too. The offline unit tests (src/**\/*.test.ts) run under `nx test`. See
 * README.md.
 */
import { writeFileSync } from 'node:fs';

import { agentFileChecks } from './checks/agentFiles';
import { blogChecks } from './checks/blog';
import { botOutcomeChecks } from './checks/botOutcomes';
import { cachingChecks } from './checks/caching';
import { cloudfrontChecks } from './checks/cloudfront';
import { crawlerPolicyChecks } from './checks/crawlerPolicy';
import { headerChecks } from './checks/headers';
import { infraChecks } from './checks/infra';
import { migrationChecks } from './checks/migration';
import { redirectChecks } from './checks/redirects';
import { seoContentChecks } from './checks/seoContent';
import { wafChecks } from './checks/waf';
import { wafBehaviourChecks } from './checks/wafBehaviour';
import { AWS_PROFILE, Aws } from './core/aws';
import { BROWSER_UA, Http } from './core/http';
import { Live } from './core/live';
import { redact } from './core/redact';
import { printCoverage, printResults, printSummary } from './core/report';
import { exitCode, runAll } from './core/runner';
import { selfTest } from './core/selftest';
import { AREAS, type CheckDef, type Options } from './core/types';
import { parseWindow } from './core/wafLogs';
import { BOT_OUTCOME_DEFAULTS } from './expected/botOutcomes';
import { HEALTH } from './expected/edge';

const HELP = `Usage: yarn nx run ag-grid-edge-verification:test:edge-live -- [options]
       npx tsx testing/edge-verification/src/main.ts [options]

Verifies production www.ag-grid.com: AWS edge configuration (read-only, profile ${AWS_PROFILE})
and live HTTP behaviour (GET/HEAD only, low volume). Exit code 1 on any failure.

  --only <list>         Comma-separated areas or check-id prefixes (end one with $ for an exact id). Areas:
                        ${Object.keys(AREAS).join(', ')}
  --pending             Also evaluate expectations that are not deployed yet (never fail the run)
  --strict              Known issues and warnings also fail the run
  --list                List the selected checks without running them
  --verbose             Show detail for passing checks and every HTTP request
  --full-links          Check every link in llms.txt (~850, slow); default samples the index
  --days <n>            CloudTrail window for the write-event summary (default ${HEALTH.cloudTrailDays})
  --max-requests <n>    HTTP request cap (default 600)
  --concurrency <n>     Concurrent HTTP requests (default 4)
  --delay <ms>          Minimum gap between request starts (default 120)
  --user-agent <ua>     Override the default browser User-Agent
  --json <file>         Also write the results as JSON
  --bot-window <dur>    bot-outcomes: WAF log window, e.g. 30m or 2h (default 2h)
  --bot-threshold <%>   bot-outcomes: highest acceptable non-ALLOW share in percent (default 1)
  --bot-min-volume <n>  bot-outcomes: smaller populations are reported, not judged (default ${BOT_OUTCOME_DEFAULTS.minVolume})
  --bot-max-gb <n>      bot-outcomes: refuse the query if it would scan more (default ${BOT_OUTCOME_DEFAULTS.maxBytes / 1e9})
  --help`;

function parseArgs(argv: string[]): Options {
    const opts: Options = {
        pending: false,
        strict: false,
        list: false,
        verbose: false,
        fullLinks: false,
        days: HEALTH.cloudTrailDays,
        maxRequests: 600,
        concurrency: 4,
        delayMs: 120,
        userAgent: BROWSER_UA,
        botWindowMs: BOT_OUTCOME_DEFAULTS.windowMs,
        botThreshold: BOT_OUTCOME_DEFAULTS.maxNonAllowShare,
        botMinVolume: BOT_OUTCOME_DEFAULTS.minVolume,
        botMaxBytes: BOT_OUTCOME_DEFAULTS.maxBytes,
    };
    const value = (i: number, flag: string): string => {
        const v = argv[i + 1];
        if (v === undefined || v.startsWith('--')) {
            throw new Error(`${flag} needs a value`);
        }
        return v;
    };
    const num = (i: number, flag: string): number => {
        const n = Number(value(i, flag));
        if (!Number.isFinite(n) || n < 0) {
            throw new Error(`${flag} needs a non-negative number`);
        }
        return n;
    };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        switch (a) {
            case '--only':
                opts.only = value(i++, a)
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
                break;
            case '--pending':
                opts.pending = true;
                break;
            case '--strict':
                opts.strict = true;
                break;
            case '--list':
                opts.list = true;
                break;
            case '--verbose':
                opts.verbose = true;
                break;
            case '--full-links':
                opts.fullLinks = true;
                break;
            case '--days':
                opts.days = num(i++, a);
                break;
            case '--max-requests':
                opts.maxRequests = num(i++, a);
                break;
            case '--concurrency':
                opts.concurrency = Math.max(1, Math.min(8, num(i++, a)));
                break;
            case '--delay':
                opts.delayMs = num(i++, a);
                break;
            case '--user-agent':
                opts.userAgent = value(i++, a);
                break;
            case '--json':
                opts.jsonOut = value(i++, a);
                break;
            case '--bot-window':
                opts.botWindowMs = parseWindow(value(i++, a));
                break;
            case '--bot-threshold':
                opts.botThreshold = num(i++, a) / 100;
                break;
            case '--bot-min-volume':
                opts.botMinVolume = num(i++, a);
                break;
            case '--bot-max-gb':
                opts.botMaxBytes = num(i++, a) * 1e9;
                break;
            case '--help':
            case '-h':
                console.log(HELP);
                process.exit(0);
                break;
            case '--':
                break;
            default:
                throw new Error(`unknown option ${a}`);
        }
    }
    return opts;
}

export function allChecks(): CheckDef[] {
    return [
        ...cloudfrontChecks(),
        ...wafChecks(),
        ...infraChecks(),
        ...redirectChecks(),
        ...migrationChecks(),
        ...headerChecks(),
        ...cachingChecks(),
        ...wafBehaviourChecks(),
        ...crawlerPolicyChecks(),
        ...agentFileChecks(),
        ...seoContentChecks(),
        ...blogChecks(),
        ...botOutcomeChecks(),
    ];
}

function select(checks: CheckDef[], only?: string[]): CheckDef[] {
    if (!only?.length) {
        return checks.filter((c) => !c.onlyWhenSelected);
    }
    // An entry ending in `$` names one check id exactly; any other entry is an area or an id prefix.
    const matches = (o: string, c: CheckDef): boolean =>
        o.endsWith('$') ? c.id === o.slice(0, -1) : c.area === o || c.id.startsWith(o);
    const unknown = only.filter((o) => !checks.some((c) => matches(o, c)));
    if (unknown.length) {
        throw new Error(`--only: no area or check id matches ${unknown.join(', ')}`);
    }
    return checks.filter((c) => only.some((o) => matches(o, c)));
}

async function main(): Promise<number> {
    const opts = parseArgs(process.argv.slice(2));
    selfTest();

    const checks = allChecks();
    const ids = new Set<string>();
    for (const c of checks) {
        if (ids.has(c.id)) {
            throw new Error(`duplicate check id ${c.id}`);
        }
        ids.add(c.id);
    }
    const selected = select(checks, opts.only);

    if (opts.list) {
        for (const c of selected) {
            const marker = c.pending
                ? ` (pending: ${c.pending})`
                : c.knownIssue
                  ? ` (known issue: ${c.knownIssue})`
                  : '';
            console.log(`${c.id}\t${c.title}${marker}`);
        }
        console.log(`\n${selected.length} checks`);
        return 0;
    }

    const aws = new Aws();
    const http = new Http(opts);
    const live = new Live(aws);
    await live.prepareGuard();
    http.setMarkdownGuard(live.markdownGuard);

    console.log(`Edge verification of production www.ag-grid.com - ${new Date().toISOString()}`);
    console.log(
        `${selected.length} checks; AWS profile ${AWS_PROFILE}; markdown guard: ${live.guardSource}; ${opts.pending ? 'evaluating pending' : 'pending not evaluated'}`
    );
    let done = 0;
    const results = await runAll(selected, { http, aws, live, opts }, 6, () => {
        done++;
        if (process.stderr.isTTY) {
            process.stderr.write(`\r  ${done}/${selected.length} checks, ${http.requestCount} requests`);
        }
    });
    if (process.stderr.isTTY) {
        process.stderr.write('\n');
    }
    http.close();

    printResults(results, opts.verbose);
    printSummary(results, {
        http: http.requestCount,
        maxRequests: opts.maxRequests,
        aws: aws.callCount,
        denied: [...aws.denied],
        refused: http.refusedProbes,
        guard: live.guardSource,
    });
    printCoverage(results);

    if (opts.jsonOut) {
        const data = results.map((r) => ({
            id: r.check.id,
            area: r.check.area,
            title: r.check.title,
            status: r.status,
            detail: r.detail,
            refs: r.check.refs,
            pending: r.check.pending,
            knownIssue: r.check.knownIssue,
            fixedBy: r.check.fixedBy,
            ms: r.ms,
        }));
        writeFileSync(
            opts.jsonOut,
            redact(JSON.stringify({ when: new Date().toISOString(), requests: http.log, results: data }, null, 2))
        );
    }
    return exitCode(results, opts.strict);
}

main().then(
    (code) => process.exit(code),
    (e) => {
        console.error(redact(`edge verification aborted: ${(e as Error).stack ?? e}`));
        process.exit(2);
    }
);
