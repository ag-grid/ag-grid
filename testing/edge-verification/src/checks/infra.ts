import { type CheckDef, Problems, fail, info, pass, warn } from '../core/types';
import { ACCOUNT_ID, ALARMS, ALB, CF_ACL, DISTRIBUTION_ID, HEALTH, SHIELD } from '../expected/edge';

const sorted = (xs: string[]): string[] => [...xs].sort();

const isoAgo = (ms: number): string => new Date(Date.now() - ms).toISOString();
const DAY = 24 * 3600 * 1000;

async function metricSum(
    aws: import('../core/aws').Aws,
    region: string,
    namespace: string,
    metric: string,
    dims: Record<string, string>,
    statistic: 'Sum' | 'Average' | 'Minimum' | 'Maximum',
    periodSeconds = 86400
): Promise<number | undefined> {
    const r = await aws.call(
        'cloudwatch',
        'get-metric-statistics',
        [
            '--namespace',
            namespace,
            '--metric-name',
            metric,
            '--dimensions',
            ...Object.entries(dims).map(([k, v]) => `Name=${k},Value=${v}`),
            '--start-time',
            isoAgo(DAY),
            '--end-time',
            new Date().toISOString(),
            '--period',
            String(periodSeconds),
            '--statistics',
            statistic,
        ],
        region
    );
    const points: any[] = r.Datapoints ?? [];
    if (!points.length) {
        return undefined;
    }
    if (statistic === 'Sum') {
        return points.reduce((a, p) => a + p.Sum, 0);
    }
    if (statistic === 'Minimum') {
        return Math.min(...points.map((p) => p.Minimum));
    }
    if (statistic === 'Maximum') {
        return Math.max(...points.map((p) => p.Maximum));
    }
    return points.reduce((a, p) => a + p.Average, 0) / points.length;
}

/**
 * Write events that change the edge, per event source. Sources not listed are ignored; a
 * source mapped to a pattern only counts matching event names (Lambda log streams and
 * ApplicationInsights housekeeping would otherwise drown the signal).
 */
const DRIFT_EVENTS: Record<string, RegExp> = {
    'cloudfront.amazonaws.com': /./,
    'wafv2.amazonaws.com': /./,
    'shield.amazonaws.com': /./,
    'elasticloadbalancing.amazonaws.com': /./,
    'acm.amazonaws.com': /./,
    'ec2.amazonaws.com': /SecurityGroup|PrefixList/,
    'logs.amazonaws.com': /RetentionPolicy|DeleteLogGroup/,
    'monitoring.amazonaws.com': /Alarm/,
};

export function infraChecks(): CheckDef[] {
    return [
        ...ALARMS.map(
            (exp): CheckDef => ({
                id: `infra.alarm.${exp.name}`,
                area: 'infra',
                title: `Alarm ${exp.name} exists, is wired to ${exp.topic} and watches the declared metric`,
                refs: ['waf-finding.md §14'],
                pending: exp.pending,
                async run({ aws }) {
                    const r = await aws.call('cloudwatch', 'describe-alarms', ['--alarm-names', exp.name], exp.region);
                    const a = r.MetricAlarms?.[0];
                    if (!a) {
                        return fail('alarm not found');
                    }
                    const p = new Problems();
                    p.eq('actions enabled', a.ActionsEnabled, true);
                    p.check(
                        (a.AlarmActions ?? []).some((arn: string) => arn.endsWith(`:${exp.topic}`)),
                        `AlarmActions ${JSON.stringify(a.AlarmActions)} do not include ${exp.topic}`
                    );
                    if (exp.namespace) {
                        p.eq('namespace', a.Namespace, exp.namespace);
                    }
                    if (exp.metric) {
                        p.eq('metric', a.MetricName, exp.metric);
                    }
                    if (exp.dimensions) {
                        // The complete set: CloudWatch names a metric by all its dimensions, so an extra one
                        // watches a different (possibly empty) metric.
                        const byName = (d: Array<[string, unknown]>) =>
                            Object.fromEntries(d.sort(([x], [y]) => x.localeCompare(y)));
                        p.eq(
                            'dimensions',
                            byName((a.Dimensions ?? []).map((d: any) => [d.Name, d.Value])),
                            byName(Object.entries(exp.dimensions))
                        );
                    }
                    if (exp.comparison) {
                        p.eq('comparison', a.ComparisonOperator, exp.comparison);
                    }
                    if (exp.threshold !== undefined) {
                        p.eq('threshold', a.Threshold, exp.threshold);
                    }
                    if (exp.name === 'www-traffic-floor') {
                        const m = (a.Metrics ?? []).find((x: any) => x.MetricStat);
                        const dims = Object.fromEntries(
                            (m?.MetricStat?.Metric?.Dimensions ?? []).map((d: any) => [d.Name, d.Value])
                        );
                        p.eq('watched metric', m?.MetricStat?.Metric?.MetricName, 'Requests');
                        p.eq('distribution', dims.DistributionId, DISTRIBUTION_ID);
                        p.check(
                            (a.Metrics ?? []).some((x: any) => /ANOMALY_DETECTION_BAND/.test(x.Expression ?? '')),
                            'no anomaly detection band'
                        );
                    }
                    return p.outcome(`state ${a.StateValue}`);
                },
            })
        ),
        {
            id: 'infra.alarm.captcha-alarms-track-live-rule',
            area: 'infra',
            title: 'The waf-p11-captcha-* alarms point at a rule metric that still exists on the ACL',
            refs: ['waf-finding.md §14'],
            async run({ live, aws }) {
                const metrics = new Set((await live.cfAcl()).Rules.map((x: any) => x.VisibilityConfig?.MetricName));
                const p = new Problems();
                for (const name of ['waf-p11-captcha-served', 'waf-p11-captcha-solved']) {
                    const r = await aws.call('cloudwatch', 'describe-alarms', ['--alarm-names', name], 'us-east-1');
                    const rule = (r.MetricAlarms?.[0]?.Dimensions ?? []).find((d: any) => d.Name === 'Rule')?.Value;
                    p.check(metrics.has(rule), `${name} watches Rule=${rule}, which no rule on ${CF_ACL.name} emits`);
                }
                return p.outcome();
            },
        },
        {
            id: 'infra.alarm.cert-expiry-tracks-live-certificate',
            area: 'infra',
            title: 'www-cert-expiry watches the certificate the distribution actually serves',
            async run({ live, aws }) {
                const cert = (await live.distributionConfig()).ViewerCertificate?.ACMCertificateArn;
                const r = await aws.call(
                    'cloudwatch',
                    'describe-alarms',
                    ['--alarm-names', 'www-cert-expiry'],
                    'us-east-1'
                );
                const watched = (r.MetricAlarms?.[0]?.Dimensions ?? []).find(
                    (d: any) => d.Name === 'CertificateArn'
                )?.Value;
                return watched === cert ? pass() : fail(`alarm watches ${watched}, distribution serves ${cert}`);
            },
        },
        {
            id: 'infra.certificate.expiry',
            area: 'infra',
            title: `Viewer certificate valid for at least ${HEALTH.certMinDays} more days and covers every alias`,
            async run({ live, aws }) {
                const cfg = await live.distributionConfig();
                const r = await aws.call(
                    'acm',
                    'describe-certificate',
                    ['--certificate-arn', cfg.ViewerCertificate.ACMCertificateArn],
                    'us-east-1'
                );
                const c = r.Certificate;
                const days = Math.floor((Date.parse(c.NotAfter) - Date.now()) / DAY);
                const names: string[] = [c.DomainName, ...(c.SubjectAlternativeNames ?? [])];
                const covered = (host: string) =>
                    names.some(
                        (n) =>
                            n === host ||
                            (n.startsWith('*.') &&
                                host.endsWith(n.slice(1)) &&
                                host.split('.').length === n.split('.').length)
                    );
                const p = new Problems();
                p.check(days >= HEALTH.certMinDays, `expires in ${days} days`);
                p.eq('status', c.Status, 'ISSUED');
                const uncovered = (cfg.Aliases?.Items ?? []).filter((h: string) => !covered(h));
                p.check(!uncovered.length, `aliases not covered: ${uncovered.join(', ')}`);
                return p.outcome(`${days} days left, renewal ${c.RenewalEligibility}`);
            },
        },
        {
            id: 'infra.shield',
            area: 'infra',
            title: 'Shield Advanced protects the distribution and the ALB (automatic L7 response in Count)',
            refs: ['shield-advanced-count-mode'],
            async run({ aws }) {
                const r = await aws.call('shield', 'list-protections');
                const p = new Problems();
                for (const exp of SHIELD.protections) {
                    const prot = (r.Protections ?? []).find((x: any) => x.ResourceArn === exp.resource);
                    if (!prot) {
                        p.add(`no protection for ${exp.resource}`);
                        continue;
                    }
                    const auto = prot.ApplicationLayerAutomaticResponseConfiguration;
                    p.eq(
                        `${prot.Name} auto response`,
                        auto?.Status === 'ENABLED' ? Object.keys(auto.Action ?? {})[0] : 'DISABLED',
                        exp.autoResponse
                    );
                }
                const sub = await aws.call('shield', 'describe-subscription');
                const end = Date.parse(sub.Subscription?.EndTime ?? '');
                p.check(end > Date.now(), `subscription ended ${sub.Subscription?.EndTime}`);
                return p.outcome(
                    `subscription until ${sub.Subscription?.EndTime}, auto-renew ${sub.Subscription?.AutoRenew}`
                );
            },
        },
        {
            id: 'infra.alb.security-group',
            area: 'infra',
            title: `${ALB.securityGroup}: 443 only from the CloudFront origin-facing prefix list (plus SSH)`,
            refs: ['waf-finding.md §14', 'alb-origin-waf-bypass-risk'],
            async run({ aws }) {
                const sg = (
                    await aws.call('ec2', 'describe-security-groups', ['--group-ids', ALB.securityGroup], ALB.region)
                ).SecurityGroups?.[0];
                const lists = await aws.call('ec2', 'describe-managed-prefix-lists', [], ALB.region);
                const plName = new Map<string, string>(
                    (lists.PrefixLists ?? []).map((l: any) => [l.PrefixListId, l.PrefixListName])
                );
                const live = (sg?.IpPermissions ?? []).map((perm: any) => ({
                    protocol: perm.IpProtocol,
                    port: perm.FromPort,
                    toPort: perm.ToPort,
                    cidrs: sorted([
                        ...(perm.IpRanges ?? []).map((x: any) => x.CidrIp),
                        ...(perm.Ipv6Ranges ?? []).map((x: any) => x.CidrIpv6),
                    ]),
                    prefixLists: sorted(
                        (perm.PrefixListIds ?? []).map((x: any) => plName.get(x.PrefixListId) ?? x.PrefixListId)
                    ),
                    groups: (perm.UserIdGroupPairs ?? []).length,
                }));
                const p = new Problems();
                p.eq('rule count', live.length, ALB.ingress.length);
                for (const exp of ALB.ingress) {
                    const m = live.find(
                        (x: any) => x.protocol === exp.protocol && x.port === exp.port && x.toPort === exp.port
                    );
                    if (!m) {
                        p.add(`no ${exp.protocol}/${exp.port} rule`);
                        continue;
                    }
                    p.eq(`${exp.port} CIDRs`, m.cidrs, sorted(exp.cidrs));
                    p.eq(`${exp.port} prefix lists`, m.prefixLists, sorted(exp.prefixLists));
                    p.eq(`${exp.port} SG references`, m.groups, 0);
                }
                const extra = live.filter(
                    (x: any) => !ALB.ingress.some((e) => e.protocol === x.protocol && e.port === x.port)
                );
                p.check(!extra.length, `unexpected ingress: ${JSON.stringify(extra)}`);
                return p.outcome();
            },
        },
        {
            id: 'infra.alb.attached',
            area: 'infra',
            title: `${ALB.name} is internet-facing behind ${ALB.securityGroup} only`,
            async run({ aws }) {
                const lb = (
                    await aws.call('elbv2', 'describe-load-balancers', ['--load-balancer-arns', ALB.arn], ALB.region)
                ).LoadBalancers?.[0];
                const p = new Problems();
                p.eq('security groups', lb?.SecurityGroups, [ALB.securityGroup]);
                p.eq('state', lb?.State?.Code, 'active');
                return p.outcome();
            },
        },
        {
            id: 'infra.alb.drop-invalid-headers',
            area: 'infra',
            title: 'ALB drops invalid header fields',
            refs: ['waf-finding.md §14'],
            knownIssue: ALB.dropInvalidHeaderFields.knownIssue,
            async run({ aws }) {
                const r = await aws.call(
                    'elbv2',
                    'describe-load-balancer-attributes',
                    ['--load-balancer-arn', ALB.arn],
                    ALB.region
                );
                const v = (r.Attributes ?? []).find(
                    (a: any) => a.Key === 'routing.http.drop_invalid_header_fields.enabled'
                )?.Value;
                return v === ALB.dropInvalidHeaderFields.expected ? pass() : fail(`drop_invalid_header_fields = ${v}`);
            },
        },
        {
            id: 'infra.cloudtrail.recent-writes',
            area: 'infra',
            title: 'CloudTrail: edge configuration writes in the last N days (--days)',
            refs: ['config drift'],
            async run({ aws, opts }) {
                const start = isoAgo(opts.days * DAY);
                const lines: string[] = [];
                let truncated = false;
                for (const region of ['us-east-1', ALB.region]) {
                    const r = await aws.call(
                        'cloudtrail',
                        'lookup-events',
                        [
                            '--lookup-attributes',
                            'AttributeKey=ReadOnly,AttributeValue=false',
                            '--start-time',
                            start,
                            '--max-items',
                            '2000',
                        ],
                        region
                    );
                    truncated ||= !!r.NextToken;
                    const counts = new Map<string, { n: number; last: string }>();
                    for (const e of r.Events ?? []) {
                        const src = JSON.parse(e.CloudTrailEvent ?? '{}').eventSource ?? '';
                        if (!DRIFT_EVENTS[src]?.test(e.EventName)) {
                            continue;
                        }
                        const key = `${region} ${src.split('.')[0]}:${e.EventName} by ${e.Username ?? '?'}`;
                        const c = counts.get(key) ?? { n: 0, last: '' };
                        c.n++;
                        c.last = c.last > e.EventTime ? c.last : String(e.EventTime);
                        counts.set(key, c);
                    }
                    for (const [k, v] of [...counts].sort((a, b) => (a[1].last < b[1].last ? 1 : -1))) {
                        lines.push(`${k} x${v.n} (last ${v.last})`);
                    }
                }
                const body = lines.length ? lines.join('\n          ') : 'none';
                return info(
                    `${opts.days} days${truncated ? ' (truncated at 2000 events per region)' : ''}:\n          ${body}`
                );
            },
        },
        {
            id: 'infra.health.cloudfront-5xx',
            area: 'infra',
            title: 'CloudFront 5xx error rate over 24h is under the www-5xx-rate alarm threshold',
            async run({ aws }) {
                const alarm = (
                    await aws.call('cloudwatch', 'describe-alarms', ['--alarm-names', 'www-5xx-rate'], 'us-east-1')
                ).MetricAlarms?.[0];
                const threshold = alarm?.Threshold ?? 5;
                const avg = await metricSum(
                    aws,
                    'us-east-1',
                    'AWS/CloudFront',
                    '5xxErrorRate',
                    { DistributionId: DISTRIBUTION_ID, Region: 'Global' },
                    'Average',
                    3600
                );
                const peak = await metricSum(
                    aws,
                    'us-east-1',
                    'AWS/CloudFront',
                    '5xxErrorRate',
                    { DistributionId: DISTRIBUTION_ID, Region: 'Global' },
                    'Maximum',
                    3600
                );
                if (avg === undefined) {
                    return warn('no datapoints');
                }
                const detail = `24h average ${avg.toFixed(3)}%, worst hour ${peak?.toFixed(3)}% (alarm threshold ${threshold}%)`;
                return avg < threshold ? pass(detail) : warn(detail);
            },
        },
        {
            id: 'infra.health.origin-share',
            area: 'infra',
            title: `Share of CloudFront requests reaching the ALB over 24h is under ${HEALTH.maxOriginShare * 100}%`,
            refs: ['waf-finding.md §8'],
            async run({ aws }) {
                const cf = await metricSum(
                    aws,
                    'us-east-1',
                    'AWS/CloudFront',
                    'Requests',
                    { DistributionId: DISTRIBUTION_ID, Region: 'Global' },
                    'Sum',
                    3600
                );
                const alb = await metricSum(
                    aws,
                    ALB.region,
                    'AWS/ApplicationELB',
                    'RequestCount',
                    { LoadBalancer: ALB.metricDimension },
                    'Sum',
                    3600
                );
                if (!cf || alb === undefined) {
                    return warn('no datapoints');
                }
                const share = alb / cf;
                const detail = `ALB ${alb.toLocaleString()} / CloudFront ${cf.toLocaleString()} = ${(share * 100).toFixed(1)}%`;
                return share < HEALTH.maxOriginShare ? pass(detail) : warn(detail);
            },
        },
        {
            id: 'infra.health.healthy-hosts',
            area: 'infra',
            title: 'The ALB target group never dropped to zero healthy hosts in 24h',
            refs: ['waf-finding.md §14'],
            async run({ aws }) {
                const min = await metricSum(
                    aws,
                    ALB.region,
                    'AWS/ApplicationELB',
                    'HealthyHostCount',
                    { TargetGroup: 'targetgroup/target-group1/023f2bedf8911b95', LoadBalancer: ALB.metricDimension },
                    'Minimum',
                    300
                );
                if (min === undefined) {
                    return warn('no datapoints');
                }
                return min >= 1 ? pass(`minimum ${min}`) : warn(`healthy hosts fell to ${min}`);
            },
        },
        {
            id: 'infra.account',
            area: 'infra',
            title: `The read-only profile resolves to account ${ACCOUNT_ID}`,
            async run({ aws }) {
                const r = await aws.call('sts', 'get-caller-identity');
                return r.Account === ACCOUNT_ID ? pass(r.Arn) : fail(`account ${r.Account}`);
            },
        },
    ];
}
