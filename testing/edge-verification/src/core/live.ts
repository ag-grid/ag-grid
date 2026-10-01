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
import { Aws } from './aws';
import { selectBehaviour } from './cfPattern';
import type { MarkdownGuard } from './http';
import { SECRET_HEADER_PATTERN, registerSecret } from './redact';

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
        return this.aws.call('cloudfront', 'get-distribution-config', ['--id', DISTRIBUTION_ID]).then((r) => {
            for (const origin of r.DistributionConfig?.Origins?.Items ?? []) {
                for (const h of origin.CustomHeaders?.Items ?? []) {
                    registerSecret(h.HeaderValue);
                }
            }
            return r.DistributionConfig;
        });
    }

    distribution(): Promise<any> {
        return this.aws.call('cloudfront', 'get-distribution', ['--id', DISTRIBUTION_ID]).then((r) => r.Distribution);
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

    // ---- the markdown guard -----------------------------------------------------------------

    private guardState?: {
        source: 'live' | 'declared';
        aliases: Set<string>;
        behaviours: BehaviourView[];
        defaultBehaviour: BehaviourView;
        policies: Map<string, PolicyView>;
        note?: string;
    };

    /**
     * Loads what the markdown guard needs: the live behaviours and their cache policies. If AWS
     * is unreachable it falls back to the declared expectation, and in that mode never allows a
     * markdown probe on a caching behaviour (it cannot prove the key is split).
     */
    prepareGuard(): Promise<void> {
        // Memoised: checks call this freely, and the guard must not change mid-run.
        this.guardReady ??= this.loadGuard();
        return this.guardReady;
    }

    private guardReady?: Promise<void>;

    private async loadGuard(): Promise<void> {
        try {
            const cfg = await this.distributionConfig();
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
            this.guardState = {
                source: 'live',
                aliases: new Set<string>(cfg.Aliases?.Items ?? []),
                behaviours,
                defaultBehaviour,
                policies,
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
                note: `distribution config unavailable (${(e as Error).message}); markdown guard uses the declared behaviours`,
            };
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

    /** True when markdown and HTML get separate cache entries on this behaviour (live config only). */
    markdownKeySplit(path: string): boolean {
        const state = this.guardState;
        if (!state || state.source !== 'live') {
            return false;
        }
        const { behaviour, policy } = this.behaviourFor(path);
        return (
            !!policy?.keyHeaders.includes(MARKDOWN_KEY_HEADER) &&
            behaviour.functionArns.some((arn) => arn.endsWith(`:function/${MARKDOWN_KEY_FUNCTION}`))
        );
    }

    readonly markdownGuard: MarkdownGuard = (url) => {
        const state = this.guardState;
        if (!state) {
            return { allowed: false, reason: 'guard not prepared' };
        }
        if (!state.aliases.has(url.hostname)) {
            return { allowed: false, reason: `${url.hostname} is not served by ${DISTRIBUTION_ID}` };
        }
        const { behaviour, caches } = this.behaviourFor(url.pathname);
        if (!caches) {
            return { allowed: true, reason: `behaviour ${behaviour.pattern} does not cache` };
        }
        if (this.markdownKeySplit(url.pathname)) {
            return { allowed: true, reason: `behaviour ${behaviour.pattern} keys the cache on ${MARKDOWN_KEY_HEADER}` };
        }
        return { allowed: false, reason: `behaviour ${behaviour.pattern} caches without a markdown cache-key split` };
    };
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
