import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { BOT_TOKENS, botOutcomeChecks, combine } from '../checks/botOutcomes';
import { FakeAws, cfAclHandlers, cfAclRules, offlineCtx } from '../testing/fakes';
import { isReadOnlyOperation } from './aws';
import type { Outcome } from './types';
import {
    BotQueryRefused,
    buildBotQuery,
    describeRows,
    judge,
    parseBotResults,
    parseWindow,
    runBotQuery,
    tally,
} from './wafLogs';

/** One GetQueryResults row, in the CLI's [{field, value}] shape. */
const row = (fam: string, action: string, rule: string, n: number, verified = 0, userTriggered = 0, dataCentre = 0) =>
    Object.entries({ fam, action, terminatingRuleId: rule, n, verified, userTriggered, dataCentre }).map(
        ([field, value]) => ({ field, value: String(value) })
    );

const TH = { maxNonAllowShare: 0.01, minVolume: 100 };

describe('WAF log query text', () => {
    const q = buildBotQuery(['GPTBot', 'claude-user', 'chrome privacy preserving prefetch proxy', 'a.b/c']);

    it('filters on the UA tokens before it parses', () => {
        const lines = q.split('\n');
        assert.match(lines[0], /^filter @message like \/\(\?i\)\(/);
        assert.ok(lines.findIndex((l) => l.includes('parse')) > 0, 'parse comes after the filter');
    });

    it('takes the family from the user-agent header value, never a header index', () => {
        assert.match(q, /"name":"user-agent","value":"\[\^"\]\*\?\(\?<fam>/);
        assert.doesNotMatch(q, /headers\.\d|headers\[\d/);
    });

    it('lower-cases tokens, puts longer ones first and escapes regex metacharacters and slashes', () => {
        assert.match(q, /\(chrome privacy preserving prefetch proxy\|claude-user\|gptbot\|a\\\.b\\\/c\)/);
    });

    it('counts by family, action and terminating rule with the label splits', () => {
        assert.match(
            q,
            /stats count\(\*\) as n, sum\(strcontains\(@message, "bot-control:bot:verified"\)\) as verified/
        );
        assert.match(q, /by fam, action, terminatingRuleId/);
    });
});

describe('parsing and judging the results', () => {
    const rows = parseBotResults([
        row('Googlebot', 'ALLOW', 'Default_Action', 990, 990),
        row('googlebot', 'ALLOW', 'Default_Action', 10, 10),
        row('Googlebot', 'BLOCK', 'AWS-AWSManagedRulesCommonRuleSet', 30, 0),
        row('Googlebot', 'BLOCK', 'AWS-AWSManagedRulesBotControlRuleSet', 5, 5, 0, 5),
        [{ field: 'action', value: 'ALLOW' }],
    ]);

    it('merges tokens that differ only in case and drops rows with no family', () => {
        assert.equal(rows.length, 3);
        assert.equal(rows.find((r) => r.action === 'ALLOW')?.n, 1000);
    });

    it('splits verified from unverified, and leaves payload-rule blocks out when asked', () => {
        assert.deepEqual(tally(rows, 'verified', false), { total: 1005, nonAllow: 5, payloadBlocked: 0 });
        assert.deepEqual(tally(rows, 'unverified', true), { total: 0, nonAllow: 0, payloadBlocked: 30 });
        assert.deepEqual(tally(rows, 'all', false), { total: 1035, nonAllow: 35, payloadBlocked: 0 });
        assert.deepEqual(tally(rows, 'all', true), { total: 1005, nonAllow: 5, payloadBlocked: 30 });
    });

    it('fails above the threshold, passes at or below it, and does not judge below the floor', () => {
        assert.equal(judge('x', { total: 1000, nonAllow: 10, payloadBlocked: 0 }, TH).verdict, 'pass');
        assert.equal(judge('x', { total: 1000, nonAllow: 11, payloadBlocked: 0 }, TH).verdict, 'fail');
        assert.equal(judge('x', { total: 99, nonAllow: 99, payloadBlocked: 0 }, TH).verdict, 'below-floor');
    });

    it('describes totals by action and rule with the verified split', () => {
        const text = describeRows(rows);
        assert.match(text, /^1035 requests, 1005 bot:verified/);
        assert.match(text, /ALLOW 1000 \[Default_Action 1000 \(1000 verified\)\]/);
        assert.match(text, /BotControlRuleSet 5 \(5 verified, 5 data-centre\)/);
    });

    it('combines: any fail fails, nothing judged is info', () => {
        assert.equal(
            combine(
                [
                    { verdict: 'pass', text: '' },
                    { verdict: 'fail', text: '' },
                ],
                ''
            ).status,
            'fail'
        );
        assert.equal(combine([{ verdict: 'below-floor', text: '' }], '').status, 'info');
        assert.equal(
            combine(
                [
                    { verdict: 'pass', text: '' },
                    { verdict: 'below-floor', text: '' },
                ],
                ''
            ).status,
            'pass'
        );
    });

    it('parses the window flag', () => {
        assert.equal(parseWindow('2h'), 7_200_000);
        assert.equal(parseWindow('30m'), 1_800_000);
        assert.equal(parseWindow('45'), 2_700_000);
        assert.throws(() => parseWindow('2d'));
    });
});

describe('running the query', () => {
    const complete = (results: any[], bytesScanned = 1.1e9) => ({
        status: 'Complete',
        results,
        statistics: { bytesScanned, recordsScanned: 500_000, recordsMatched: 1234 },
    });
    const incoming = (gbPerPoint: number, points = 24) => ({
        Datapoints: Array.from({ length: points }, () => ({ Sum: gbPerPoint * 1e9 })),
    });

    it('start-query is allowed for logs only', () => {
        assert.ok(isReadOnlyOperation('logs', 'start-query'));
        assert.ok(isReadOnlyOperation('logs', 'get-query-results'));
        assert.ok(!isReadOnlyOperation('athena', 'start-query'));
        assert.ok(!isReadOnlyOperation('logs', 'stop-query'));
        assert.ok(!isReadOnlyOperation('logs', 'put-log-events'));
    });

    it('refuses before starting when IncomingBytes says the scan is over the cap', async () => {
        const aws = new FakeAws({
            'cloudwatch get-metric-statistics': () => incoming(0.2),
            'logs start-query': () => assert.fail('must not start'),
        });
        await assert.rejects(
            runBotQuery(aws, { windowMs: 7_200_000, maxBytes: 3e9, tokens: ['gptbot'] }),
            BotQueryRefused
        );
        assert.ok(!aws.calls.includes('logs start-query'));
    });

    it('falls back to the declared ingest rate when IncomingBytes has no data', async () => {
        const aws = new FakeAws({
            'cloudwatch get-metric-statistics': () => ({ Datapoints: [] }),
            'logs start-query': () => assert.fail('must not start'),
        });
        await assert.rejects(
            runBotQuery(aws, { windowMs: 24 * 3_600_000, maxBytes: 3e9, tokens: ['gptbot'] }),
            /declared/
        );
    });

    it('polls until Complete and reports bytes scanned', async () => {
        let polls = 0;
        const aws = new FakeAws({
            'cloudwatch get-metric-statistics': () => incoming(0.04),
            'logs start-query': (args) => {
                const q = args[args.indexOf('--query-string') + 1];
                assert.match(q, /^filter @message like/);
                return { queryId: 'q-1' };
            },
            'logs get-query-results': () =>
                ++polls < 3 ? { status: 'Running' } : complete([row('GPTBot', 'ALLOW', 'Default_Action', 50, 50)]),
        });
        const r = await runBotQuery(aws, { windowMs: 7_200_000, maxBytes: 3e9, tokens: ['gptbot'], pollMs: 1 });
        assert.equal(polls, 3);
        assert.equal(r.bytesScanned, 1.1e9);
        assert.equal(r.rows[0].n, 50);
        assert.equal(r.end.getTime() - r.start.getTime(), 7_200_000);
    });
});

describe('bot-outcomes checks', () => {
    const results = [
        row('Googlebot', 'ALLOW', 'Default_Action', 2000, 2000),
        row('Googlebot', 'BLOCK', 'AWS-AWSManagedRulesBotControlRuleSet', 50, 50, 0, 50),
        row('GPTBot', 'ALLOW', 'Default_Action', 500, 400),
        row('GPTBot', 'BLOCK', 'AWS-AWSManagedRulesKnownBadInputsRuleSet', 40, 0),
        row('meta-webindexer', 'BLOCK', 'block-nonbrowser-except-ai-assistants', 300, 0),
    ];
    const ctx = () =>
        offlineCtx(
            new FakeAws({
                ...cfAclHandlers(cfAclRules()),
                'cloudwatch get-metric-statistics': () => ({ Datapoints: [{ Sum: 1e9 }] }),
                'logs start-query': () => ({ queryId: 'q' }),
                'logs get-query-results': () => ({
                    status: 'Complete',
                    results,
                    statistics: { bytesScanned: 1e9, recordsScanned: 1, recordsMatched: 1 },
                }),
            })
        );
    const runCheck = async (id: string, c = ctx()): Promise<Outcome> => {
        const check = botOutcomeChecks().find((x) => x.id === id);
        assert.ok(check, `no check ${id}`);
        return check.run(c);
    };

    it('every family token is in the query', () => {
        assert.ok(BOT_TOKENS.includes('meta-webindexer') && BOT_TOKENS.includes('claude-code'));
    });

    it('fails a verified crawler blocked above the threshold', async () => {
        const o = await runCheck('bot-outcomes.Googlebot');
        assert.equal(o.status, 'fail', o.detail);
        assert.match(o.detail ?? '', /verified: 50\/2050/);
    });

    it('passes an allowlisted family whose only blocks are payload rules', async () => {
        const o = await runCheck('bot-outcomes.GPTBot');
        assert.equal(o.status, 'pass', o.detail);
        assert.match(o.detail ?? '', /40 payload-rule blocks excluded/);
    });

    it('judges a blocked unverified family not in the allowlist only through its extra check', async () => {
        const c = ctx();
        assert.equal((await runCheck('bot-outcomes.Meta-WebIndexer', c)).status, 'info');
        const extra = await runCheck('bot-outcomes.Meta-WebIndexer.all', c);
        assert.equal(extra.status, 'fail', extra.detail);
    });

    it('the query runs once per run however many checks read it', async () => {
        const c = ctx();
        await runCheck('bot-outcomes.Googlebot', c);
        await runCheck('bot-outcomes.GPTBot', c);
        await runCheck('bot-outcomes.query', c);
        assert.equal((c.aws as FakeAws).calls.filter((x) => x === 'logs start-query').length, 1);
    });

    it('skips every check when the query is refused', async () => {
        const c = offlineCtx(
            new FakeAws({
                ...cfAclHandlers(cfAclRules()),
                'cloudwatch get-metric-statistics': () => ({ Datapoints: [{ Sum: 9e9 }] }),
            })
        );
        const o = await runCheck('bot-outcomes.query', c);
        assert.equal(o.status, 'skip');
        assert.match(o.detail ?? '', /over the 3\.00 GB cap/);
    });
});
