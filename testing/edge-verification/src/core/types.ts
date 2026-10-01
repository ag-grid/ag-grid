import type { Aws } from './aws';
import type { Http } from './http';
import type { Live } from './live';

/** Check areas, in report order. `--only` takes these names. */
export const AREAS = {
    cloudfront: 'CloudFront distribution, behaviours and cache policies (AWS, read-only)',
    'waf-config': 'WAF web ACLs, logging and redaction (AWS, read-only)',
    infra: 'Alarms, Shield, origin security group, real-time logs, CloudTrail and health (AWS, read-only)',
    redirects: 'Single-hop redirects across every host alias',
    migration: 'Already-deployed archives after the grid#15430 .htaccess migration',
    headers: 'Response headers per content class',
    caching: 'CloudFront cache behaviour and markdown-poisoning guards',
    'waf-behaviour': 'WAF decisions as seen from this machine',
    'crawler-policy': 'robots.txt rules and their agreement with the WAF allowlist',
    'agent-files': 'llms.txt, AGENTS.md and the MCP server card',
    'seo-content': 'Page-level SEO: headings, structured data, meta tags, landmarks',
    blog: 'The /blog/ migration',
} as const;

export type Area = keyof typeof AREAS;

/** What a check's own logic concluded, before its lifecycle markers are applied. */
export type RawStatus = 'pass' | 'fail' | 'warn' | 'info' | 'skip';

export interface Outcome {
    status: RawStatus;
    detail?: string;
}

/**
 * Lifecycle of an expectation:
 * - neither marker: deployed, a failure fails the run.
 * - `pending`: describes a state not yet live. Only evaluated with --pending, never fails the run.
 * - `knownIssue`: a verified current defect. Evaluated always, reported separately, fails the run
 *   only with --strict.
 */
export interface CheckDef {
    /** Unique and stable, `<area>.<topic>...`. */
    id: string;
    area: Area;
    title: string;
    /** Tickets (SE-x), findings (waf-finding.md §x), PRs and scripts this check verifies. */
    refs?: string[];
    /** What deploys it, e.g. 'grid#15411' or 'redact-waf-log-secrets.sh'. */
    pending?: string;
    /** The waf-finding.md section that records the defect. */
    knownIssue?: string;
    /** Optional pointer to the change expected to fix a known issue. */
    fixedBy?: string;
    /** Left out of a run without --only; selected when --only names its area or an id prefix. */
    onlyWhenSelected?: boolean;
    run(ctx: Ctx): Promise<Outcome>;
}

export type FinalStatus =
    'pass' | 'fail' | 'warn' | 'info' | 'skip' | 'pending' | 'pending-live' | 'known' | 'known-fixed';

export interface Result {
    check: CheckDef;
    status: FinalStatus;
    detail?: string;
    ms: number;
}

export interface Options {
    only?: string[];
    pending: boolean;
    strict: boolean;
    list: boolean;
    verbose: boolean;
    fullLinks: boolean;
    jsonOut?: string;
    days: number;
    maxRequests: number;
    concurrency: number;
    delayMs: number;
    userAgent: string;
}

export interface Ctx {
    http: Http;
    aws: Aws;
    live: Live;
    opts: Options;
}

export const pass = (detail?: string): Outcome => ({ status: 'pass', detail });
export const fail = (detail: string): Outcome => ({ status: 'fail', detail });
export const warn = (detail: string): Outcome => ({ status: 'warn', detail });
export const info = (detail: string): Outcome => ({ status: 'info', detail });
export const skip = (detail: string): Outcome => ({ status: 'skip', detail });

/** Collects mismatches so a check can report every problem at once rather than the first. */
export class Problems {
    private readonly items: string[] = [];

    add(message: string): void {
        this.items.push(message);
    }

    eq(label: string, actual: unknown, expected: unknown): void {
        const a = JSON.stringify(actual);
        const e = JSON.stringify(expected);
        if (a !== e) {
            this.items.push(`${label}: got ${a}, expected ${e}`);
        }
    }

    check(condition: boolean, message: string): void {
        if (!condition) {
            this.items.push(message);
        }
    }

    get count(): number {
        return this.items.length;
    }

    /** Copies another collector's problems in, each prefixed (e.g. with the page they came from). */
    merge(prefix: string, other: Problems): void {
        for (const item of other.items) {
            this.items.push(`${prefix}: ${item}`);
        }
    }

    outcome(passDetail?: string): Outcome {
        return this.items.length ? fail(this.items.join('; ')) : pass(passDetail);
    }
}
