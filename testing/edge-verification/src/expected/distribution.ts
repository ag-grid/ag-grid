import { SECRET } from '../core/redact';
import {
    ACCOUNT_ID,
    type BehaviourExpectation,
    CF_ACL,
    type CachePolicyExpectation,
    DISTRIBUTION,
    ORIGIN_ID,
    REALTIME_LOG_CONFIG,
} from './edge';

/**
 * The distribution, its origin, behaviours and policies as get-distribution-config and
 * get-cache-policy return them, built from the declarations in edge.ts so each value is declared
 * once. The cloudfront checks compare every field of the live objects with these.
 *
 * The origin's verify-header value is never declared: it is SECRET here, the live one is replaced
 * by SECRET before comparing, and waf-config.alb.origin-secret-in-sync compares the values in memory.
 */

/** CloudFront's {Quantity, Items} list, with no Items key when empty, as the CLI returns it. */
const list = <T>(items: T[]): any => ({ Quantity: items.length, ...(items.length ? { Items: items } : {}) });

export const functionArn = (name: string): string => `arn:aws:cloudfront::${ACCOUNT_ID}:function/${name}`;

/**
 * Everything get-distribution-config returns besides the origins and behaviours (their own checks
 * compare those), minus CallerReference (fixed at creation) and Comment (prose).
 */
export function declaredDistributionSettings(): any {
    const cert = DISTRIBUTION.certificateArn;
    return {
        Aliases: list(DISTRIBUTION.aliases),
        DefaultRootObject: '',
        OriginGroups: list([]),
        CustomErrorResponses: list([]),
        Logging: { Enabled: DISTRIBUTION.standardLogging, IncludeCookies: false, Bucket: '', Prefix: '' },
        PriceClass: DISTRIBUTION.priceClass,
        Enabled: true,
        ViewerCertificate: {
            CloudFrontDefaultCertificate: false,
            ACMCertificateArn: cert,
            SSLSupportMethod: DISTRIBUTION.sslSupportMethod,
            MinimumProtocolVersion: DISTRIBUTION.minimumProtocolVersion,
            // The CLI repeats the certificate under its deprecated name.
            Certificate: cert,
            CertificateSource: 'acm',
        },
        Restrictions: { GeoRestriction: { RestrictionType: 'none', Quantity: 0 } },
        WebACLId: `arn:aws:wafv2:${CF_ACL.region}:${ACCOUNT_ID}:global/webacl/${CF_ACL.name}/${CF_ACL.id}`,
        HttpVersion: DISTRIBUTION.httpVersion,
        IsIPV6Enabled: DISTRIBUTION.ipv6,
        ContinuousDeploymentPolicyId: '',
        Staging: false,
    };
}

export const DISTRIBUTION_UNPINNED = [
    'CallerReference',
    'Comment',
    'Origins',
    'DefaultCacheBehavior',
    'CacheBehaviors',
];

/** The origin list, with Origin Shield as deployed (off) or as its pending change leaves it. */
export function declaredOrigins(originShield: boolean): any {
    const o = DISTRIBUTION.origin;
    const shield = DISTRIBUTION.originShield;
    return list([
        {
            Id: o.id,
            DomainName: o.domain,
            OriginPath: '',
            CustomHeaders: list(o.customHeaderNames.map((HeaderName) => ({ HeaderName, HeaderValue: SECRET }))),
            CustomOriginConfig: {
                HTTPPort: 80,
                HTTPSPort: 443,
                OriginProtocolPolicy: o.protocolPolicy,
                OriginSslProtocols: list(o.sslProtocols),
                OriginReadTimeout: o.readTimeout,
                OriginKeepaliveTimeout: o.keepaliveTimeout,
                IpAddressType: 'ipv4',
            },
            ConnectionAttempts: o.connectionAttempts,
            ConnectionTimeout: o.connectionTimeout,
            OriginShield: originShield
                ? { Enabled: shield.enabled, OriginShieldRegion: shield.region }
                : { Enabled: false },
            OriginAccessControlId: '',
        },
    ]);
}

/**
 * A behaviour as get-distribution-config returns it. Policies are named through `cachePolicyId` and
 * `originRequestPolicyId`, so a check can compare by name and a fixture can use real ids.
 */
export function declaredBehaviour(
    exp: Omit<BehaviourExpectation, 'pattern' | 'why'> & { pattern?: string },
    cachePolicyId: (name: string) => string,
    originRequestPolicyId: (name: string) => string
): any {
    return {
        ...(exp.pattern ? { PathPattern: exp.pattern } : {}),
        TargetOriginId: ORIGIN_ID,
        TrustedSigners: { Enabled: false, Quantity: 0 },
        TrustedKeyGroups: { Enabled: false, Quantity: 0 },
        ViewerProtocolPolicy: exp.viewerProtocolPolicy,
        AllowedMethods: { ...list(exp.allowedMethods), CachedMethods: list(exp.cachedMethods) },
        SmoothStreaming: false,
        Compress: exp.compress,
        LambdaFunctionAssociations: list([]),
        FunctionAssociations: list(
            exp.viewerRequestFunctions.map((name) => ({ FunctionARN: functionArn(name), EventType: 'viewer-request' }))
        ),
        FieldLevelEncryptionId: '',
        RealtimeLogConfigArn: `arn:aws:cloudfront::${ACCOUNT_ID}:realtime-log-config/${exp.realtimeLogConfig}`,
        CachePolicyId: cachePolicyId(exp.cachePolicy),
        OriginRequestPolicyId: originRequestPolicyId(exp.originRequestPolicy),
        GrpcConfig: { Enabled: false },
    };
}

/** A cache policy's CachePolicyConfig, its Comment aside (prose). */
export function declaredCachePolicy(exp: CachePolicyExpectation): any {
    return {
        Name: exp.name,
        DefaultTTL: exp.defaultTtl,
        MaxTTL: exp.maxTtl,
        MinTTL: exp.minTtl,
        ParametersInCacheKeyAndForwardedToOrigin: {
            EnableAcceptEncodingGzip: exp.gzip,
            EnableAcceptEncodingBrotli: exp.brotli,
            HeadersConfig: exp.keyHeaders.length
                ? { HeaderBehavior: 'whitelist', Headers: list(exp.keyHeaders) }
                : { HeaderBehavior: 'none' },
            CookiesConfig: { CookieBehavior: exp.cookies },
            QueryStringsConfig: { QueryStringBehavior: exp.queryStrings },
        },
    };
}

/** The real-time log configuration, its ARN aside (it follows from the name). */
export function declaredRealtimeLogConfig(): any {
    return {
        Name: REALTIME_LOG_CONFIG.name,
        SamplingRate: REALTIME_LOG_CONFIG.samplingRate,
        Fields: REALTIME_LOG_CONFIG.fields,
        EndPoints: [
            {
                StreamType: 'Kinesis',
                KinesisStreamConfig: { RoleARN: REALTIME_LOG_CONFIG.role, StreamARN: REALTIME_LOG_CONFIG.stream },
            },
        ],
    };
}
