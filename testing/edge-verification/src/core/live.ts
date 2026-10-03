import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
    ALB_ACL,
    BEHAVIOURS,
    CACHE_POLICIES,
    CF_ACL,
    DEFAULT_BEHAVIOUR,
    DISTRIBUTION,
    DISTRIBUTION_ID,
    MARKDOWN_KEY_FUNCTION,
    MARKDOWN_KEY_HEADER,
} from '../expected/edge';
import { Aws, AwsError } from './aws';
import { selectBehaviour } from './cfPattern';
import type { MarkdownGuard } from './http';
import { SECRET_HEADER_PATTERN, registerSecret } from './redact';
import type { Options } from './types';
import { type BotQueryResult, runBotQuery } from './wafLogs';

/** The parts of a cache behaviour the guard and the checks need, live or declared. */
export interface BehaviourView {
    pattern: string;
    cachePolicyId: string;
    functionArns: string[];
}

export interface PolicyView {
    id: string;
    name: string;
    minTtl: number;
    defaultTtl: number;
    maxTtl: number;
    keyHeaders: string[];
}

/**
 * Lazily-loaded, memoised live AWS state. Every getter goes through the read-only Aws client.
 * Secrets are registered with the redactor the moment they are parsed.
 */
export class Live {
    constructor(readonly aws: Aws) {}

    distributionConfig(): Promise<any> {
        return this.aws
            .call('cloudfront', 'get-distribution-config', ['--id', DISTRIBUTION_ID])
            .then((r) => registerOriginSecrets(r.DistributionConfig));
    }

    /** The distribution's status together with the config it describes, in one snapshot. */
    distribution(): Promise<any> {
        return this.aws.call('cloudfront', 'get-distribution', ['--id', DISTRIBUTION_ID]).then((r) => {
            registerOriginSecrets(r.Distribution?.DistributionConfig);
            return r.Distribution;
        });
    }

    cachePolicy(id: string): Promise<any> {
        return this.aws.call('cloudfront', 'get-cache-policy', ['--id', id]).then((r) => r.CachePolicy);
    }

    customCachePolicies(): Promise<any[]> {
        return this.aws
            .call('cloudfront', 'list-cache-policies', ['--type', 'custom'])
            .then((r) => (r.CachePolicyList?.Items ?? []).map((i: any) => i.CachePolicy));
    }

    originRequestPolicy(id: string): Promise<any> {
        return this.aws
            .call('cloudfront', 'get-origin-request-policy', ['--id', id])
            .then((r) => r.OriginRequestPolicy);
    }

    realtimeLogConfig(name: string): Promise<any> {
        return this.aws
            .call('cloudfront', 'get-realtime-log-config', ['--name', name])
            .then((r) => r.RealtimeLogConfig);
    }

    cfAcl(): Promise<any> {
        return this.webAcl(CF_ACL.name, CF_ACL.id, CF_ACL.scope, CF_ACL.region);
    }

    albAcl(): Promise<any> {
        return this.webAcl(ALB_ACL.name, ALB_ACL.id, ALB_ACL.scope, ALB_ACL.region);
    }

    private webAcl(name: string, id: string, scope: string, region: string): Promise<any> {
        return this.aws
            .call('wafv2', 'get-web-acl', ['--name', name, '--scope', scope, '--id', id], region)
            .then((r) => {
                registerVerifySecrets(r.WebACL);
                return r.WebACL;
            });
    }

    /** null when the ACL has no logging configuration (WAFNonexistentItemException). */
    loggingConfig(aclArn: string, region: string): Promise<any | null> {
        return this.aws
            .call('wafv2', 'get-logging-configuration', ['--resource-arn', aclArn], region)
            .then((r) => r.LoggingConfiguration)
            .catch((e) => {
                if (e.code === 'WAFNonexistentItemException') {
                    return null;
                }
                throw e;
            });
    }

    ipSet(name: string, id: string, scope: string, region: string): Promise<any> {
        return this.aws
            .call('wafv2', 'get-ip-set', ['--name', name, '--scope', scope, '--id', id], region)
            .then((r) => r.IPSet);
    }

    private botQuery?: Promise<BotQueryResult>;

    /** The WAF-log bot query, run once per run however many checks read it. */
    botOutcomes(opts: Options, tokens: string[]): Promise<BotQueryResult> {
        this.botQuery ??= runBotQuery(this.aws, {
            windowMs: opts.botWindowMs,
            maxBytes: opts.botMaxBytes,
            tokens,
        });
        return this.botQuery;
    }

    // ---- the markdown guard -----------------------------------------------------------------

    private guardState?: {
        source: 'live' | 'declared';
        aliases: Set<string>;
        behaviours: BehaviourView[];
        defaultBehaviour: BehaviourView;
        policies: Map<string, PolicyView>;
        /** Whether the LIVE code of the markdown key function was read and derives the key header. */
        keyFunction: { verified: boolean; reason: string };
        /**
         * Whether the distribution reported itself Deployed when the guard was prepared. The config
         * is control-plane state: while a change is InProgress, edges may still serve the previous
         * configuration, so the config read says nothing reliable about what a probe would hit.
         */
        deployment: { deployed: boolean; reason: string };
        /** Why the live config could not be read (declared fallback only). */
        error?: unknown;
        note?: string;
    };

    /**
     * Loads what the markdown guard needs: the live behaviours, their cache policies and, when a
     * behaviour relies on it, the published code of the markdown key function. If the live config
     * cannot be read the declared behaviours stand in for the checks that only need a behaviour's
     * pattern, but the guard then refuses EVERY markdown probe: a path declared uncached may have
     * drifted to caching, which is exactly what this suite exists to catch.
     */
    prepareGuard(): Promise<void> {
        // Memoised: checks call this freely, and the guard must not change mid-run.
        this.guardReady ??= this.loadGuard();
        return this.guardReady;
    }

    private guardReady?: Promise<void>;

    private async loadGuard(): Promise<void> {
        // The status and the config come from the same get-distribution snapshot, so a change that
        // starts between two reads cannot pair a Deployed status with a still-propagating config.
        const { deployment, config } = await this.deploymentSnapshot();
        try {
            // Without a snapshot config the probes are already refused; this read only serves the
            // structural checks.
            const cfg = config ?? (await this.distributionConfig());
            const behaviours: BehaviourView[] = (cfg.CacheBehaviors?.Items ?? []).map((b: any) =>
                toView(b, b.PathPattern)
            );
            const defaultBehaviour = toView(cfg.DefaultCacheBehavior, '*');
            const ids = new Set([defaultBehaviour, ...behaviours].map((b) => b.cachePolicyId));
            const policies = new Map<string, PolicyView>();
            for (const id of ids) {
                const p = await this.cachePolicy(id);
                policies.set(id, toPolicyView(p));
            }
            const reliesOnFunction = [defaultBehaviour, ...behaviours].some(
                (b) => policies.get(b.cachePolicyId)?.keyHeaders.includes(MARKDOWN_KEY_HEADER) && hasKeyFunction(b)
            );
            this.guardState = {
                source: 'live',
                aliases: new Set<string>(cfg.Aliases?.Items ?? []),
                behaviours,
                defaultBehaviour,
                policies,
                keyFunction: reliesOnFunction
                    ? await this.verifyMarkdownKeyFunction()
                    : { verified: false, reason: 'no behaviour keys its cache on the markdown function' },
                deployment,
                note: deployment.deployed ? deployment.reason : `${deployment.reason}; every markdown probe is refused`,
            };
        } catch (e) {
            const policies = new Map<string, PolicyView>();
            for (const p of CACHE_POLICIES) {
                policies.set(p.name, {
                    id: p.name,
                    name: p.name,
                    minTtl: p.minTtl,
                    defaultTtl: p.defaultTtl,
                    maxTtl: p.maxTtl,
                    keyHeaders: p.keyHeaders,
                });
            }
            this.guardState = {
                source: 'declared',
                aliases: new Set(DISTRIBUTION.aliases),
                // Pending behaviours are included: if one is live, its paths must be treated as cached.
                behaviours: BEHAVIOURS.map((b) => ({
                    pattern: b.pattern,
                    cachePolicyId: b.cachePolicy,
                    functionArns: [],
                })),
                defaultBehaviour: { pattern: '*', cachePolicyId: DEFAULT_BEHAVIOUR.cachePolicy, functionArns: [] },
                policies,
                keyFunction: { verified: false, reason: 'live distribution config unavailable' },
                deployment,
                error: e,
                note: `distribution config unavailable (${(e as Error).message}); every markdown probe is refused`,
            };
        }
    }

    /**
     * Whether the distribution is Deployed, with the config that status describes. Anything else,
     * a failed read or a snapshot without its config included, is not Deployed.
     */
    private async deploymentSnapshot(): Promise<{ deployment: { deployed: boolean; reason: string }; config?: any }> {
        try {
            const d = await this.distribution();
            const config = d?.DistributionConfig;
            if (!config) {
                return { deployment: { deployed: false, reason: 'distribution snapshot has no config' } };
            }
            const status = d.Status;
            return {
                config,
                deployment:
                    status === 'Deployed'
                        ? { deployed: true, reason: 'distribution status Deployed' }
                        : { deployed: false, reason: `distribution status ${status || '(not reported)'}` },
            };
        } catch (e) {
            const why =
                e instanceof AwsError && e.deniedAction ? `needs IAM action ${e.deniedAction}` : (e as Error).message;
            return { deployment: { deployed: false, reason: `distribution status unreadable (${why})` } };
        }
    }

    /**
     * Reads the LIVE stage of the markdown key function (cloudfront:GetFunction) and checks that
     * its code derives the key header from the Accept test Apache uses. Unverified on any error,
     * a denied read included: a matching function name alone proves nothing about what it does.
     */
    private async verifyMarkdownKeyFunction(): Promise<{ verified: boolean; reason: string }> {
        const dir = mkdtempSync(join(tmpdir(), 'edge-verification-'));
        try {
            // get-function writes the code to a local file (its positional outfile argument).
            const out = join(dir, `${MARKDOWN_KEY_FUNCTION}.js`);
            await this.aws.call('cloudfront', 'get-function', [
                '--name',
                MARKDOWN_KEY_FUNCTION,
                '--stage',
                'LIVE',
                out,
            ]);
            const problems = markdownKeyFunctionProblems(readFileSync(out, 'utf8'));
            return problems.length
                ? { verified: false, reason: `LIVE ${MARKDOWN_KEY_FUNCTION} code: ${problems.join('; ')}` }
                : {
                      verified: true,
                      reason: `LIVE ${MARKDOWN_KEY_FUNCTION} code sets ${MARKDOWN_KEY_HEADER} from Accept`,
                  };
        } catch (e) {
            const why =
                e instanceof AwsError && e.deniedAction ? `needs IAM action ${e.deniedAction}` : (e as Error).message;
            return { verified: false, reason: `LIVE ${MARKDOWN_KEY_FUNCTION} code not verified (${why})` };
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    }

    /** Rethrows why the live config could not be read, for checks that must judge the live state. */
    requireLiveGuard(): void {
        if (!this.guardState) {
            throw new Error('markdown guard not prepared');
        }
        if (this.guardState.source !== 'live') {
            throw this.guardState.error;
        }
    }

    get guardSource(): string {
        return this.guardState
            ? `${this.guardState.source}${this.guardState.note ? ' - ' + this.guardState.note : ''}`
            : 'not loaded';
    }

    /** The behaviour serving a path, and whether it caches. */
    behaviourFor(path: string): { behaviour: BehaviourView; policy?: PolicyView; caches: boolean } {
        const state = this.guardState;
        if (!state) {
            throw new Error('markdown guard not prepared');
        }
        const i = selectBehaviour(
            state.behaviours.map((b) => b.pattern),
            path
        );
        const behaviour = i < 0 ? state.defaultBehaviour : state.behaviours[i];
        const policy = state.policies.get(behaviour.cachePolicyId);
        // An unknown policy is assumed to cache: fail closed.
        const caches = !policy || policy.maxTtl > 0 || policy.defaultTtl > 0 || policy.minTtl > 0;
        return { behaviour, policy, caches };
    }

    /**
     * Whether markdown and HTML get separate cache entries on this path's behaviour: the live
     * policy keys on the header, the live behaviour runs the function, AND the function's LIVE
     * code was read and derives the header from Accept. Never from the declared fallback.
     */
    markdownSplit(path: string): { split: boolean; reason: string } {
        const state = this.guardState;
        if (!state || state.source !== 'live') {
            return { split: false, reason: 'live distribution config unavailable' };
        }
        const { behaviour, policy } = this.behaviourFor(path);
        if (!policy?.keyHeaders.includes(MARKDOWN_KEY_HEADER)) {
            return { split: false, reason: `behaviour ${behaviour.pattern} does not key on ${MARKDOWN_KEY_HEADER}` };
        }
        if (!hasKeyFunction(behaviour)) {
            return { split: false, reason: `behaviour ${behaviour.pattern} does not run ${MARKDOWN_KEY_FUNCTION}` };
        }
        return { split: state.keyFunction.verified, reason: state.keyFunction.reason };
    }

    markdownKeySplit(path: string): boolean {
        return this.markdownSplit(path).split;
    }

    readonly markdownGuard: MarkdownGuard = (url) => {
        const state = this.guardState;
        if (!state) {
            return { allowed: false, reason: 'guard not prepared' };
        }
        if (state.source !== 'live') {
            // The declared behaviours say what SHOULD be uncached; only the live config says what is.
            return {
                allowed: false,
                reason: 'live distribution config unavailable: markdown probes need verified cache state',
            };
        }
        if (!state.deployment.deployed) {
            return {
                allowed: false,
                reason: `live config not verified as Deployed (${state.deployment.reason}): edges may serve another configuration`,
            };
        }
        if (!state.aliases.has(url.hostname)) {
            return { allowed: false, reason: `${url.hostname} is not served by ${DISTRIBUTION_ID}` };
        }
        const { behaviour, caches } = this.behaviourFor(url.pathname);
        if (!caches) {
            return { allowed: true, reason: `behaviour ${behaviour.pattern} does not cache` };
        }
        const { split, reason } = this.markdownSplit(url.pathname);
        if (split) {
            return {
                allowed: true,
                reason: `behaviour ${behaviour.pattern} keys the cache on ${MARKDOWN_KEY_HEADER}; ${reason}`,
            };
        }
        return {
            allowed: false,
            reason: `behaviour ${behaviour.pattern} caches without a verified markdown cache-key split: ${reason}`,
        };
    };
}

const hasKeyFunction = (b: BehaviourView): boolean =>
    b.functionArns.some((arn) => arn.endsWith(`:function/${MARKDOWN_KEY_FUNCTION}`));

/**
 * What is wrong with a markdown key function's code, statically: it must read the Accept header,
 * set x-ag-accept-markdown exactly once to one of two different values chosen by a
 * case-sensitive "text/markdown" substring test of that header (the test Apache's
 * negotiation uses), and return the request. Anything else - a constant, another media type, a
 * second assignment - is refused: an unusual but correct function only costs a refused probe.
 */
export function markdownKeyFunctionProblems(code: string): string[] {
    const src = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    const problems: string[] = [];
    // `headers` here is either event.request.headers itself or a variable bound to it (checked
    // below); a property of some other object (`x.headers`) never counts.
    const requestHeaders = String.raw`(?<![\w$.])(?:event\s*\.\s*request\s*\.\s*)?headers`;
    const acceptRead = new RegExp(
        String.raw`${requestHeaders}\s*(?:\.\s*accept|\[\s*['"]accept['"]\s*\])\s*\.\s*value`
    );
    const acceptVar = new RegExp(
        String.raw`(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*[^;\n]*${acceptRead.source}[^;\n]*`
    ).exec(src)?.[1];
    if (!acceptVar && !acceptRead.test(src)) {
        problems.push('does not read the Accept header');
    }
    const header = MARKDOWN_KEY_HEADER.replace(/-/g, '\\-');
    const assignments = [
        ...src.matchAll(
            new RegExp(
                String.raw`${requestHeaders}\s*\[\s*['"]${header}['"]\s*\]\s*=\s*\{\s*value\s*:\s*([^}]*)\}`,
                'g'
            )
        ),
    ];
    const mentions = src.toLowerCase().split(MARKDOWN_KEY_HEADER).length - 1;
    if (assignments.length !== 1 || mentions !== 1) {
        problems.push(
            `does not set ${MARKDOWN_KEY_HEADER} exactly once (${assignments.length} assignments, ${mentions} mentions)`
        );
    } else {
        const subject = String.raw`(?:${acceptVar ? String.raw`${acceptVar}\b|` : ''}${acceptRead.source})`;
        const test = new RegExp(
            String.raw`^\(?\s*(?:${subject}\s*\.\s*indexOf\(\s*(['"])text/markdown\1\s*\)\s*(?:!==?\s*-1|>\s*-1|>=\s*0)|${subject}\s*\.\s*includes\(\s*(['"])text/markdown\2\s*\)|/text\\/markdown/\.test\(\s*${subject}\s*\))\s*\)?\s*\?\s*(['"])([^'"]*)\3\s*:\s*(['"])([^'"]*)\5\s*,?\s*$`
        );
        const m = test.exec(assignments[0][1].trim());
        if (!m) {
            problems.push(`${MARKDOWN_KEY_HEADER} is not chosen by a text/markdown test of the Accept header`);
        } else if (m[4] === m[6]) {
            problems.push(`${MARKDOWN_KEY_HEADER} is '${m[4]}' either way`);
        }
    }
    if (!/return\s+event\.request\s*;?/.test(src)) {
        problems.push('does not return the request');
    }
    // The header must land on the request that is returned: no replacement request, and a bare
    // `headers` only as one binding to event.request.headers that is never reassigned.
    if (/(?<![\w$.])event\s*(?:\.\s*request\s*(?:\.\s*headers\s*)?)?=(?!=)/.test(src)) {
        problems.push('replaces event, event.request or its headers');
    }
    if (/(?<![\w$.])headers\b/.test(src.replace(/event\s*\.\s*request\s*\.\s*headers/g, ''))) {
        const bindings = src.match(/(?:var|let|const)\s+headers\s*=\s*event\s*\.\s*request\s*\.\s*headers\s*(?:;|$)/gm);
        const writes = src.match(/(?<![\w$.])headers\s*=(?!=)/g);
        if (bindings?.length !== 1 || writes?.length !== 1) {
            problems.push('headers is not bound once to event.request.headers');
        }
    }
    const shape = straightLineProblem(src);
    if (shape) {
        problems.push(shape);
    }
    return problems;
}

/**
 * Fails closed on control flow: the code must be exactly `function handler(event) { ... }` whose
 * body is a straight line of the statements the published function uses, ending in
 * `return event.request;`. An early return, an `if`, a loop or a `try` could leave some requests
 * without the key, so any statement outside these shapes is a problem.
 */
function straightLineProblem(src: string): string | undefined {
    const compact = src
        .replace(/\s+/g, ' ')
        .replace(/ ?([^\w$ ]) ?/g, '$1')
        .trim();
    const body = /^function handler\(event\)\{(.*)\}$/.exec(compact)?.[1];
    if (body === undefined) {
        return 'is not a single function handler(event) { ... }';
    }
    const statements = body.split(';');
    if (statements.pop() !== '' || statements.pop() !== 'return event.request') {
        return 'does not end with return event.request;';
    }
    const h = String.raw`(?:event\.request\.)?headers`;
    const accept = String.raw`${h}(?:\.accept|\['accept'\]|\["accept"\])`;
    const key = MARKDOWN_KEY_HEADER.replace(/-/g, '\\-');
    const allowed = [
        /^(?:var|let|const) headers=event\.request\.headers$/,
        new RegExp(String.raw`^(?:var|let|const) [A-Za-z_$][\w$]*=${accept}\?${accept}\.value:(?:''|"")$`),
        new RegExp(String.raw`^${h}\[(?:'${key}'|"${key}")\]=\{value:[^{};]*\}$`),
    ];
    const other = statements.find((st) => !allowed.some((re) => re.test(st)));
    return other === undefined ? undefined : `has a statement outside the verified straight-line shape: ${other}`;
}

function toView(b: any, pattern: string): BehaviourView {
    return {
        pattern,
        cachePolicyId: b.CachePolicyId,
        functionArns: (b.FunctionAssociations?.Items ?? [])
            .filter((f: any) => f.EventType === 'viewer-request')
            .map((f: any) => f.FunctionARN),
    };
}

export function toPolicyView(p: any): PolicyView {
    const c = p.CachePolicyConfig;
    const headers = c.ParametersInCacheKeyAndForwardedToOrigin?.HeadersConfig;
    return {
        id: p.Id,
        name: c.Name,
        minTtl: c.MinTTL,
        defaultTtl: c.DefaultTTL,
        maxTtl: c.MaxTTL,
        keyHeaders: (headers?.Headers?.Items ?? []).map((h: string) => h.toLowerCase()),
    };
}

/** Registers every origin custom header value in a distribution config as a secret. */
function registerOriginSecrets(cfg: any): any {
    for (const origin of cfg?.Origins?.Items ?? []) {
        for (const h of origin.CustomHeaders?.Items ?? []) {
            registerSecret(h.HeaderValue);
        }
    }
    return cfg;
}

/** Walks an ACL and registers every verify-header ByteMatch search string as a secret. */
function registerVerifySecrets(node: unknown): void {
    if (Array.isArray(node)) {
        node.forEach(registerVerifySecrets);
    } else if (node && typeof node === 'object') {
        const obj = node as Record<string, any>;
        const bm = obj.ByteMatchStatement;
        if (bm && SECRET_HEADER_PATTERN.test(bm.FieldToMatch?.SingleHeader?.Name ?? '')) {
            registerSecret(decodeSearchString(bm.SearchString));
            registerSecret(bm.SearchString);
        }
        Object.values(obj).forEach(registerVerifySecrets);
    }
}

/** The CLI returns WAF SearchString blobs base64-encoded. */
export function decodeSearchString(value: string | undefined): string {
    return value ? Buffer.from(value, 'base64').toString('utf8') : '';
}
