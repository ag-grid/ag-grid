import { AwsError } from './aws';
import { BudgetExceeded, RefusedProbe } from './http';
import type { CheckDef, Ctx, FinalStatus, Outcome, Result } from './types';

/** Turns a check's own outcome into its reported status, applying the lifecycle markers. */
export function classify(check: CheckDef, outcome: Outcome): FinalStatus {
    if (check.pending) {
        if (outcome.status === 'pass') {
            return 'pending-live';
        }
        return outcome.status === 'skip' ? 'skip' : 'pending';
    }
    if (check.knownIssue) {
        if (outcome.status === 'pass') {
            return 'known-fixed';
        }
        return outcome.status === 'fail' ? 'known' : outcome.status;
    }
    return outcome.status;
}

function errorOutcome(e: unknown): Outcome {
    if (e instanceof AwsError) {
        return {
            status: 'skip',
            detail: e.deniedAction ? `unverifiable - needs IAM action ${e.deniedAction}` : e.message,
        };
    }
    if (e instanceof BudgetExceeded) {
        return { status: 'skip', detail: `not run: ${e.message} (raise --max-requests)` };
    }
    if (e instanceof RefusedProbe) {
        return { status: 'skip', detail: `SAFETY: ${e.message}` };
    }
    return { status: 'fail', detail: `error: ${(e as Error).message ?? String(e)}` };
}

export async function runOne(check: CheckDef, ctx: Ctx): Promise<Result> {
    const started = Date.now();
    if (check.pending && !ctx.opts.pending) {
        return { check, status: 'pending', detail: `not run (deployed by ${check.pending}; use --pending)`, ms: 0 };
    }
    let outcome: Outcome;
    try {
        outcome = await check.run(ctx);
    } catch (e) {
        outcome = errorOutcome(e);
    }
    return { check, status: classify(check, outcome), detail: outcome.detail, ms: Date.now() - started };
}

/** Runs checks with a small worker pool; results come back in the input order. */
export async function runAll(
    checks: CheckDef[],
    ctx: Ctx,
    workers: number,
    onDone?: (r: Result) => void
): Promise<Result[]> {
    const results: Result[] = new Array(checks.length);
    let next = 0;
    const worker = async (): Promise<void> => {
        while (next < checks.length) {
            const i = next++;
            results[i] = await runOne(checks[i], ctx);
            onDone?.(results[i]);
        }
    };
    await Promise.all(Array.from({ length: Math.min(workers, checks.length) }, worker));
    return results;
}

/** Exit code: failures always fail the run; --strict also fails on known issues and warnings. */
export function exitCode(results: Result[], strict: boolean): number {
    const failing = new Set<FinalStatus>(strict ? ['fail', 'known', 'warn'] : ['fail']);
    return results.some((r) => failing.has(r.status)) ? 1 : 0;
}
