import type { Aws } from './aws';

/**
 * What real crawlers and AI agents receive, from the CloudFront WAF's own logs: one CloudWatch Logs
 * Insights query over aws-waf-logs-cloudfront (us-east-1), read-only (logs:StartQuery and
 * logs:GetQueryResults, plus cloudwatch:GetMetricStatistics for the size estimate).
 *
 * The group ingests ~2.5-3.5M requests (~12-15 GB) a day, and Insights bills by bytes scanned, so:
 * - the window is short (2h by default), and the query is refused before it starts when the
 *   group's IncomingBytes over the window (or, if that cannot be read, a declared ingest rate) is
 *   over the byte cap; the bytes actually scanned are reported afterwards;
 * - the cheap `filter` on the UA substrings runs BEFORE `parse`: a parse across the whole group
 *   silently under-counts (~13%, measured 2026-08-06);
 * - the user agent is matched inside @message (`"name":"user-agent","value":"..."`, any case),
 *   never by header-array index: header order is not fixed.
 */
export const WAF_LOG_GROUP = 'aws-waf-logs-cloudfront';
export const WAF_LOG_REGION = 'us-east-1';

/**
 * Insights scanned more than the group ingested over the same window: 0.10 GB for a 5-minute
 * window when IncomingBytes was 0.6 GB/h (2026-10-01). The estimate is scaled by this so the cap
 * errs on the safe side.
 */
export const SCAN_TO_INGEST_FACTOR = 2;

/** Used only when IncomingBytes cannot be read: ~15 GB/day at the top of the measured range, rounded up. */
export const DECLARED_INGEST_BYTES_PER_HOUR = 0.7e9;

/** WAF log delivery lags a few minutes; the window ends this long ago so it is complete. */
export const LOG_DELIVERY_LAG_MS = 5 * 60_000;

/** Payload rules: a block by one of these is a request's content, not its identity (spoofs, probes). */
export const PAYLOAD_RULES = new Set([
    'AWS-AWSManagedRulesCommonRuleSet',
    'AWS-AWSManagedRulesKnownBadInputsRuleSet',
    'AWS-AWSManagedRulesAmazonIpReputationList',
    'block-credential-scanner-paths',
]);

const VERIFIED_LABEL = 'bot-control:bot:verified';
const USER_TRIGGERED_LABEL = 'bot-control:bot:user_triggered:verified';
const DATA_CENTRE_LABEL = 'bot-control:signal:known_bot_data_center';

/** A UA family token as it appears in the user agent, lower-cased; regex metacharacters escaped. */
const escapeToken = (token: string): string => token.toLowerCase().replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

/**
 * The Insights query: filter on the UA tokens, then parse the family out of the user-agent header
 * value only, then one grouped count. Longer tokens come first so a shared prefix cannot shadow
 * them at the same position.
 */
export function buildBotQuery(tokens: string[]): string {
    const alternation = [...new Set(tokens.map((t) => t.toLowerCase()))]
        .sort((a, b) => b.length - a.length)
        .map(escapeToken)
        .join('|');
    return [
        `filter @message like /(?i)(${alternation})/`,
        `| parse @message /(?i)"name":"user-agent","value":"[^"]*?(?<fam>${alternation})/`,
        '| filter ispresent(fam)',
        `| stats count(*) as n, sum(strcontains(@message, "${VERIFIED_LABEL}")) as verified, sum(strcontains(@message, "${USER_TRIGGERED_LABEL}")) as userTriggered, sum(strcontains(@message, "${DATA_CENTRE_LABEL}")) as dataCentre by fam, action, terminatingRuleId`,
        '| limit 10000',
    ].join('\n');
}

/** One stats row, with the family token lower-cased. */
export interface BotRow {
    token: string;
    action: string;
    rule: string;
    n: number;
    /** Requests Bot Control labelled bot:verified. */
    verified: number;
    /** Requests Bot Control labelled bot:user_triggered:verified. */
    userTriggered: number;
    /** Requests carrying the known_bot_data_center signal. */
    dataCentre: number;
}

/** Parses GetQueryResults rows ([{field, value}...]) and merges rows whose token differs only in case. */
export function parseBotResults(results: Array<Array<{ field: string; value: string }>>): BotRow[] {
    const merged = new Map<string, BotRow>();
    for (const row of results) {
        const f = Object.fromEntries(row.map((c) => [c.field, c.value]));
        if (!f.fam) {
            continue;
        }
        const token = f.fam.toLowerCase();
        const action = f.action ?? 'UNKNOWN';
        const rule = f.terminatingRuleId ?? 'UNKNOWN';
        const key = JSON.stringify([token, action, rule]);
        const r = merged.get(key) ?? { token, action, rule, n: 0, verified: 0, userTriggered: 0, dataCentre: 0 };
        r.n += Number(f.n ?? 0);
        r.verified += Number(f.verified ?? 0);
        r.userTriggered += Number(f.userTriggered ?? 0);
        r.dataCentre += Number(f.dataCentre ?? 0);
        merged.set(key, r);
    }
    return [...merged.values()];
}

/** Which requests of a family a judgement covers. */
export type Population = 'verified' | 'unverified' | 'all';

export interface Tally {
    total: number;
    nonAllow: number;
    /** Excluded from both counts: blocked by a payload rule. */
    payloadBlocked: number;
}

/** Requests in a population, and how many were not allowed (optionally ignoring payload-rule blocks). */
export function tally(rows: BotRow[], population: Population, excludePayload: boolean): Tally {
    const t: Tally = { total: 0, nonAllow: 0, payloadBlocked: 0 };
    for (const r of rows) {
        const labelled = r.verified + r.userTriggered;
        const n = population === 'verified' ? labelled : population === 'unverified' ? r.n - labelled : r.n;
        if (n <= 0) {
            continue;
        }
        if (excludePayload && r.action !== 'ALLOW' && PAYLOAD_RULES.has(r.rule)) {
            t.payloadBlocked += n;
            continue;
        }
        t.total += n;
        if (r.action !== 'ALLOW') {
            t.nonAllow += n;
        }
    }
    return t;
}

export interface Thresholds {
    /** Highest acceptable non-ALLOW share, as a fraction (0.01 = 1%). */
    maxNonAllowShare: number;
    /** Fewer requests than this in a population are reported, not judged. */
    minVolume: number;
}

export type Judgement = { verdict: 'pass' | 'fail' | 'below-floor'; text: string };

export function judge(label: string, t: Tally, th: Thresholds): Judgement {
    const share = t.total ? t.nonAllow / t.total : 0;
    const pct = (share * 100).toFixed(2);
    const payload = t.payloadBlocked ? `, ${t.payloadBlocked} payload-rule blocks excluded` : '';
    const text = `${label}: ${t.nonAllow}/${t.total} not allowed (${pct}%)${payload}`;
    if (t.total < th.minVolume) {
        return { verdict: 'below-floor', text: `${text} - below the ${th.minVolume}-request floor, not judged` };
    }
    return share > th.maxNonAllowShare
        ? { verdict: 'fail', text: `${text} > ${(th.maxNonAllowShare * 100).toFixed(2)}%` }
        : { verdict: 'pass', text };
}

/** "ALLOW 812 (Default_Action 790, allow-seo-bot 22); BLOCK 4 (...)", with the labelled split. */
export function describeRows(rows: BotRow[]): string {
    if (!rows.length) {
        return 'no requests';
    }
    const byAction = new Map<string, BotRow[]>();
    for (const r of rows) {
        byAction.set(r.action, [...(byAction.get(r.action) ?? []), r]);
    }
    const parts = [...byAction.entries()]
        .sort((a, b) => sum(b[1], 'n') - sum(a[1], 'n'))
        .map(([action, rs]) => {
            const rules = rs
                .sort((a, b) => b.n - a.n)
                .map((r) => {
                    const labelled = r.verified + r.userTriggered;
                    const dc = r.dataCentre ? `, ${r.dataCentre} data-centre` : '';
                    return `${r.rule} ${r.n}${labelled ? ` (${labelled} verified${dc})` : dc ? ` (${dc.slice(2)})` : ''}`;
                })
                .join(', ');
            return `${action} ${sum(rs, 'n')} [${rules}]`;
        });
    const verified = sum(rows, 'verified');
    const userTriggered = sum(rows, 'userTriggered');
    return `${sum(rows, 'n')} requests, ${verified} bot:verified, ${userTriggered} user_triggered:verified: ${parts.join('; ')}`;
}

const sum = (rows: BotRow[], key: 'n' | 'verified' | 'userTriggered' | 'dataCentre'): number =>
    rows.reduce((a, r) => a + r[key], 0);

// ---- running the query ----------------------------------------------------------------------

export interface BotQueryOptions {
    windowMs: number;
    maxBytes: number;
    tokens: string[];
    /** For tests: when "now" is. */
    now?: number;
    /** For tests: the gap between result polls. */
    pollMs?: number;
    timeoutMs?: number;
}

export interface BotQueryResult {
    rows: BotRow[];
    start: Date;
    end: Date;
    estimateBytes: number;
    estimateSource: string;
    bytesScanned: number;
    recordsScanned: number;
    recordsMatched: number;
    query: string;
}

/** The query was not started: it would scan more than the cap, or AWS could not run it. */
export class BotQueryRefused extends Error {}

/** IncomingBytes over the window, or the declared rate when the metric cannot be read. */
async function estimateBytes(aws: Aws, start: Date, end: Date): Promise<{ bytes: number; source: string }> {
    try {
        const r = await aws.call(
            'cloudwatch',
            'get-metric-statistics',
            [
                '--namespace',
                'AWS/Logs',
                '--metric-name',
                'IncomingBytes',
                '--dimensions',
                `Name=LogGroupName,Value=${WAF_LOG_GROUP}`,
                '--start-time',
                start.toISOString(),
                '--end-time',
                end.toISOString(),
                '--period',
                '300',
                '--statistics',
                'Sum',
            ],
            WAF_LOG_REGION
        );
        const points: any[] = r.Datapoints ?? [];
        if (points.length) {
            const ingested = points.reduce((a, p) => a + Number(p.Sum ?? 0), 0);
            return {
                bytes: ingested * SCAN_TO_INGEST_FACTOR,
                source: `${SCAN_TO_INGEST_FACTOR} x IncomingBytes ${gb(ingested)} over ${points.length} x 5 min`,
            };
        }
    } catch {
        // fall through to the declared rate
    }
    const hours = (end.getTime() - start.getTime()) / 3_600_000;
    return {
        bytes: hours * DECLARED_INGEST_BYTES_PER_HOUR * SCAN_TO_INGEST_FACTOR,
        source: `${SCAN_TO_INGEST_FACTOR} x declared ${DECLARED_INGEST_BYTES_PER_HOUR / 1e9} GB/h (IncomingBytes unavailable)`,
    };
}

export async function runBotQuery(aws: Aws, o: BotQueryOptions): Promise<BotQueryResult> {
    const end = new Date((o.now ?? Date.now()) - LOG_DELIVERY_LAG_MS);
    const start = new Date(end.getTime() - o.windowMs);
    const estimate = await estimateBytes(aws, start, end);
    if (estimate.bytes > o.maxBytes) {
        throw new BotQueryRefused(
            `would scan ~${gb(estimate.bytes)} (${estimate.source}), over the ${gb(o.maxBytes)} cap: shorten --bot-window or raise --bot-max-gb`
        );
    }
    const query = buildBotQuery(o.tokens);
    const started = await aws.call(
        'logs',
        'start-query',
        [
            '--log-group-name',
            WAF_LOG_GROUP,
            '--start-time',
            String(Math.floor(start.getTime() / 1000)),
            '--end-time',
            String(Math.floor(end.getTime() / 1000)),
            '--query-string',
            query,
            '--limit',
            '10000',
        ],
        WAF_LOG_REGION,
        { memo: false }
    );
    const queryId: string | undefined = started.queryId;
    if (!queryId) {
        throw new BotQueryRefused('start-query returned no queryId');
    }
    const deadline = Date.now() + (o.timeoutMs ?? 300_000);
    for (;;) {
        const r = await aws.call('logs', 'get-query-results', ['--query-id', queryId], WAF_LOG_REGION, {
            memo: false,
        });
        const status: string = r.status ?? 'Unknown';
        if (status === 'Complete') {
            return {
                rows: parseBotResults(r.results ?? []),
                start,
                end,
                estimateBytes: estimate.bytes,
                estimateSource: estimate.source,
                bytesScanned: Number(r.statistics?.bytesScanned ?? 0),
                recordsScanned: Number(r.statistics?.recordsScanned ?? 0),
                recordsMatched: Number(r.statistics?.recordsMatched ?? 0),
                query,
            };
        }
        if (['Failed', 'Cancelled', 'Timeout', 'Unknown'].includes(status)) {
            throw new Error(`Logs Insights query ${queryId} ended ${status}`);
        }
        if (Date.now() > deadline) {
            // logs:StopQuery is not granted (it is not a read), so the query keeps running on
            // the server; its cost was already capped by the estimate above.
            throw new Error(`Logs Insights query ${queryId} still ${status} after ${(o.timeoutMs ?? 300_000) / 1000}s`);
        }
        await new Promise((resolve) => setTimeout(resolve, o.pollMs ?? 2000));
    }
}

export const gb = (bytes: number): string => `${(bytes / 1e9).toFixed(2)} GB`;

/** "2h", "90m", "45" (minutes) -> milliseconds. */
export function parseWindow(text: string): number {
    const m = /^(\d+(?:\.\d+)?)\s*(m|min|h)?$/i.exec(text.trim());
    if (!m) {
        throw new Error(`--bot-window takes minutes or hours, e.g. 30m or 2h (got ${text})`);
    }
    const n = Number(m[1]);
    const ms = /^h/i.test(m[2] ?? '') ? n * 3_600_000 : n * 60_000;
    if (ms < 60_000) {
        throw new Error('--bot-window must be at least 1 minute');
    }
    return ms;
}
