import { type CheckDef, type Ctx, type Outcome, info, pass, skip, warn } from '../core/types';
import { leaves, regexLeafMatches } from '../core/waf';
import {
    BotQueryRefused,
    type BotQueryResult,
    type BotRow,
    type Judgement,
    type Population,
    describeRows,
    gb,
    judge,
    tally,
} from '../core/wafLogs';
import { BOT_FAMILIES, BOT_OUTCOME_REFS, type BotFamily } from '../expected/botOutcomes';

const P11 = 'block-nonbrowser-except-ai-assistants';

/** Every family token, for the query's filter and parse. */
export const BOT_TOKENS = BOT_FAMILIES.flatMap((f) => f.tokens);

const rowsOf = (result: BotQueryResult, family: BotFamily): BotRow[] =>
    result.rows.filter((r) => family.tokens.includes(r.token));

/** The p11 UA regexes, live. */
async function p11UaRegexes(ctx: Ctx): Promise<any[]> {
    const rule = (await ctx.live.cfAcl()).Rules.find((r: any) => r.Name === P11);
    return rule ? leaves(rule.Statement).filter((l) => l.kind === 'regex' && l.field === 'header:user-agent') : [];
}

/** The window's result, or the outcome a check reports when there is none. */
async function result(ctx: Ctx): Promise<BotQueryResult | Outcome> {
    try {
        return await ctx.live.botOutcomes(ctx.opts, BOT_TOKENS);
    } catch (e) {
        if (e instanceof BotQueryRefused) {
            return skip(`WAF log query not run: ${e.message}`);
        }
        throw e;
    }
}

const isOutcome = (x: BotQueryResult | Outcome): x is Outcome => 'status' in x;

/** Folds judgements into one outcome: any fail fails; nothing judged is info. */
export function combine(judgements: Judgement[], detail: string): Outcome {
    const lines = [...judgements.map((j) => j.text), detail].join(' | ');
    if (judgements.some((j) => j.verdict === 'fail')) {
        return { status: 'fail', detail: lines };
    }
    return judgements.some((j) => j.verdict === 'pass') ? pass(lines) : info(lines);
}

function familyCheck(family: BotFamily): CheckDef {
    return {
        id: `bot-outcomes.${family.name}`,
        area: 'bot-outcomes',
        title: `${family.name}: verified requests allowed, and allowed if the live p11 allowlist admits it`,
        refs: [...BOT_OUTCOME_REFS, ...(family.refs ?? [])],
        async run(ctx) {
            const r = await result(ctx);
            if (isOutcome(r)) {
                return r;
            }
            const rows = rowsOf(r, family);
            const th = thresholds(ctx);
            const judgements = [judge('verified', tally(rows, 'verified', false), th)];
            const token = family.allowlistToken ?? family.tokens[0];
            const admitted = (await p11UaRegexes(ctx)).some((l) => regexLeafMatches(l, token));
            judgements.push(
                admitted
                    ? judge('p11-allowlisted, all', tally(rows, 'all', true), th)
                    : { verdict: 'below-floor', text: `not in the live p11 allowlist ("${token}")` }
            );
            return combine(judgements, describeRows(rows));
        },
    };
}

function extraChecks(family: BotFamily): CheckDef[] {
    return (family.extra ?? []).map((x) => ({
        id: `bot-outcomes.${family.name}.${x.population}`,
        area: 'bot-outcomes',
        title: `${family.name} (${x.population} requests): allowed - ${x.why}`,
        refs: [...BOT_OUTCOME_REFS, ...(family.refs ?? [])],
        pending: x.pending,
        knownIssue: x.knownIssue,
        fixedBy: x.fixedBy,
        async run(ctx) {
            const r = await result(ctx);
            if (isOutcome(r)) {
                return r;
            }
            const rows = rowsOf(r, family);
            const population: Population = x.population;
            return combine([judge(population, tally(rows, population, true), thresholds(ctx))], describeRows(rows));
        },
    }));
}

const thresholds = (ctx: Ctx) => ({ maxNonAllowShare: ctx.opts.botThreshold, minVolume: ctx.opts.botMinVolume });

export function botOutcomeChecks(): CheckDef[] {
    return [
        {
            id: 'bot-outcomes.query',
            area: 'bot-outcomes',
            title: 'WAF log query: window, bytes scanned against the cap, families seen',
            refs: BOT_OUTCOME_REFS,
            async run(ctx) {
                const r = await result(ctx);
                if (isOutcome(r)) {
                    return r;
                }
                const families = BOT_FAMILIES.filter((f) => rowsOf(r, f).length).length;
                const detail = `${r.start.toISOString()} - ${r.end.toISOString()}: scanned ${gb(r.bytesScanned)} (estimate ${gb(r.estimateBytes)} from ${r.estimateSource}; cap ${gb(ctx.opts.botMaxBytes)}), ${r.recordsScanned} records scanned, ${r.recordsMatched} matched, ${families}/${BOT_FAMILIES.length} families seen`;
                return r.bytesScanned > ctx.opts.botMaxBytes ? warn(`over the cap: ${detail}`) : info(detail);
            },
        },
        ...BOT_FAMILIES.flatMap((f) => [familyCheck(f), ...extraChecks(f)]),
    ];
}
