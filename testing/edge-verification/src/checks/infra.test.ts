import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import type { Outcome } from '../core/types';
import { ALARMS, ALB, SHIELD } from '../expected/edge';
import { PENDING } from '../expected/lifecycle';
import { FakeAws, alarmFixture, offlineCtx } from '../testing/fakes';
import { infraChecks } from './infra';

const check = (id: string) => {
    const found = infraChecks().find((c) => c.id === id);
    assert.ok(found, `no check ${id}`);
    return found;
};

describe('infra.alarm: every field that decides what an alarm watches, when and whom it tells', () => {
    const runAlarm = (name: string, edit?: (alarm: any) => void): Promise<Outcome> => {
        const exp = ALARMS.find((a) => a.name === name)!;
        const alarm = alarmFixture(exp);
        edit?.(alarm);
        return check(`infra.alarm.${name}`).run(
            offlineCtx(new FakeAws({ 'cloudwatch describe-alarms': () => ({ MetricAlarms: [alarm] }) }))
        );
    };

    for (const exp of ALARMS) {
        it(`${exp.name} passes as declared`, async () => {
            const outcome = await runAlarm(exp.name);
            assert.equal(outcome.status, 'pass', outcome.detail);
        });
    }

    const band = (a: any): any => a.Metrics.find((m: any) => m.MetricStat).MetricStat;
    const MUTATIONS: Array<[string, string, (a: any) => void, RegExp]> = [
        // The metric-math alarm: everything that says which metric the anomaly band is drawn over.
        [
            'www-traffic-floor',
            'its band watches another namespace',
            (a) => (band(a).Metric.Namespace = 'AWS/ApplicationELB'),
            /alarm Metrics\[0\]\.MetricStat\.Metric\.Namespace: got "AWS\/ApplicationELB", expected "AWS\/CloudFront"/,
        ],
        [
            'www-traffic-floor',
            'its band loses the Region=Global dimension',
            (a) => (band(a).Metric.Dimensions = band(a).Metric.Dimensions.filter((d: any) => d.Name !== 'Region')),
            /alarm Metrics\[0\]\.MetricStat\.Metric\.Dimensions\.Region: got absent, expected "Global"/,
        ],
        [
            'www-traffic-floor',
            'its band gains a dimension',
            (a) => band(a).Metric.Dimensions.push({ Name: 'Stage', Value: 'nowhere' }),
            /alarm Metrics\[0\]\.MetricStat\.Metric\.Dimensions\.Stage: got "nowhere", expected absent/,
        ],
        [
            'www-traffic-floor',
            'its band watches another distribution',
            (a) => (band(a).Metric.Dimensions[0].Value = 'EOTHER'),
            /Dimensions\.DistributionId: got "EOTHER"/,
        ],
        [
            'www-traffic-floor',
            'its band averages instead of summing',
            (a) => (band(a).Stat = 'Average'),
            /alarm Metrics\[0\]\.MetricStat\.Stat: got "Average", expected "Sum"/,
        ],
        [
            'www-traffic-floor',
            'its band uses hourly points',
            (a) => (band(a).Period = 3600),
            /alarm Metrics\[0\]\.MetricStat\.Period: got 3600, expected 300/,
        ],
        [
            'www-traffic-floor',
            'its band narrows to 1 standard deviation',
            (a) => (a.Metrics[1].Expression = 'ANOMALY_DETECTION_BAND(m1, 1)'),
            /alarm Metrics\[1\]\.Expression: got "ANOMALY_DETECTION_BAND\(m1, 1\)"/,
        ],
        [
            'www-traffic-floor',
            'it compares with another metric id',
            (a) => (a.ThresholdMetricId = 'm1'),
            /alarm ThresholdMetricId: got "m1", expected "ad1"/,
        ],
        [
            'www-traffic-floor',
            'missing data stops counting as breaching',
            (a) => (a.TreatMissingData = 'notBreaching'),
            /alarm TreatMissingData: got "notBreaching", expected "breaching"/,
        ],
        [
            'www-traffic-floor',
            'it needs fewer datapoints',
            (a) => (a.DatapointsToAlarm = 1),
            /alarm DatapointsToAlarm: got 1, expected 3/,
        ],
        // Single-metric alarms.
        [
            'www-5xx-rate',
            'an extra dimension makes it watch another metric',
            (a) => a.Dimensions.push({ Name: 'Stage', Value: 'nowhere' }),
            /alarm Dimensions\.Stage: got "nowhere", expected absent/,
        ],
        [
            'www-5xx-rate',
            'it watches the peak instead of the average',
            (a) => (a.Statistic = 'Maximum'),
            /alarm Statistic: got "Maximum", expected "Average"/,
        ],
        [
            'www-5xx-rate',
            'it evaluates over more periods',
            (a) => (a.EvaluationPeriods = 12),
            /alarm EvaluationPeriods: got 12, expected 2/,
        ],
        [
            'www-5xx-rate',
            'it uses a percentile instead',
            (a) => {
                delete a.Statistic;
                a.ExtendedStatistic = 'p99';
            },
            /alarm ExtendedStatistic: got "p99", expected absent/,
        ],
        ['www-cert-expiry', 'its threshold drops', (a) => (a.Threshold = 3), /alarm Threshold: got 3, expected 21/],
        [
            'www-cert-expiry',
            'its comparison flips',
            (a) => (a.ComparisonOperator = 'GreaterThanThreshold'),
            /alarm ComparisonOperator: got "GreaterThanThreshold", expected "LessThanThreshold"/,
        ],
        [
            'waf-p11-captcha-solved',
            'it notifies a second topic',
            (a) => a.AlarmActions.push('arn:aws:sns:us-east-1:116606402151:other'),
            /alarm AlarmActions: extra \["arn:aws:sns:us-east-1:116606402151:other"\]/,
        ],
        [
            'waf-p11-captcha-served',
            'it starts notifying on OK',
            (a) => (a.OKActions = [...a.AlarmActions]),
            /alarm OKActions: extra/,
        ],
        [
            'ag-grid-lb1-unhealthy-host',
            'it stops notifying on OK',
            (a) => (a.OKActions = []),
            /alarm OKActions: extra \[\], missing \["arn:aws:sns:us-west-1:116606402151:ag-website-status"\]/,
        ],
        [
            'ag-grid-lb1-unhealthy-host',
            'its actions are disabled',
            (a) => (a.ActionsEnabled = false),
            /alarm ActionsEnabled: got false, expected true/,
        ],
        [
            'ag-grid-lb1-unhealthy-host',
            'it notifies on insufficient data',
            (a) => (a.InsufficientDataActions = [...a.AlarmActions]),
            /alarm InsufficientDataActions: extra/,
        ],
    ];
    for (const [name, what, edit, pattern] of MUTATIONS) {
        it(`${name} fails when ${what}`, async () => {
            const outcome = await runAlarm(name, edit);
            assert.equal(outcome.status, 'fail', outcome.detail);
            assert.match(outcome.detail ?? '', pattern);
        });
    }
});

describe('infra.alarm: waf-p11-captcha-served before and after change-captcha-alarm.sh', () => {
    const served = ALARMS.find((a) => a.name === 'waf-p11-captcha-served')!;
    const solved = ALARMS.find((a) => a.name === 'waf-p11-captcha-solved')!;
    const runOn = (id: string, alarm: any): Promise<Outcome> =>
        check(id).run(offlineCtx(new FakeAws({ 'cloudwatch describe-alarms': () => ({ MetricAlarms: [alarm] }) })));
    const silenced = (exp = served): any => ({ ...alarmFixture(exp), ActionsEnabled: false });

    it('the served alarm passes with its actions enabled or disabled', async () => {
        for (const alarm of [alarmFixture(served), silenced()]) {
            const outcome = await runOn('infra.alarm.waf-p11-captcha-served', alarm);
            assert.equal(outcome.status, 'pass', outcome.detail);
        }
    });

    it('the pending check fails while the served alarm still notifies, and passes once silenced', async () => {
        const id = 'infra.alarm.waf-p11-captcha-served.actions-disabled';
        assert.equal(check(id).pending, PENDING.captchaServedSilenced);
        const live = await runOn(id, alarmFixture(served));
        assert.equal(live.status, 'fail');
        assert.match(live.detail ?? '', /actions still enabled/);
        assert.equal((await runOn(id, silenced())).status, 'pass');
    });

    it('silencing the served alarm does not excuse any other change to it', async () => {
        const outcome = await runOn('infra.alarm.waf-p11-captcha-served', { ...silenced(), Threshold: 1 });
        assert.equal(outcome.status, 'fail');
        assert.match(outcome.detail ?? '', /alarm Threshold: got 1, expected 15000/);
    });

    it('the solved alarm, which now alerts alone, fails if its actions are disabled', async () => {
        const outcome = await runOn('infra.alarm.waf-p11-captcha-solved', silenced(solved));
        assert.equal(outcome.status, 'fail');
        assert.match(outcome.detail ?? '', /alarm ActionsEnabled: got false, expected true/);
        assert.equal(
            infraChecks().some((c) => c.id === 'infra.alarm.waf-p11-captcha-solved.actions-disabled'),
            false
        );
    });
});

describe('infra: Shield, the load balancer and its attributes', () => {
    const lb = (): any => ({
        ...structuredClone(ALB.loadBalancer),
        LoadBalancerArn: ALB.arn,
        LoadBalancerName: ALB.name,
        DNSName: 'fixture.elb.amazonaws.com',
        CanonicalHostedZoneId: 'Z0',
        CreatedTime: '2022-11-01T00:00:00Z',
        AvailabilityZones: [...structuredClone(ALB.loadBalancer.AvailabilityZones)].reverse(),
    });
    const attributes = (): any[] => [
        ...Object.entries(ALB.attributes).map(([Key, Value]) => ({ Key, Value })),
        { Key: 'routing.http.drop_invalid_header_fields.enabled', Value: 'false' },
    ];
    const protections = (): any[] =>
        SHIELD.protections.map((p, i) => ({
            Id: `id-${i}`,
            Name: `protection-${i}`,
            ProtectionArn: `arn:aws:shield::0:protection/${i}`,
            ResourceArn: p.resource,
            ApplicationLayerAutomaticResponseConfiguration: { Status: 'ENABLED', Action: { [p.autoResponse]: {} } },
        }));
    const aws = (
        edit: {
            lb?: (x: any) => void;
            attrs?: (x: any[]) => void;
            prot?: (x: any[]) => void;
            sub?: (x: any) => void;
        } = {}
    ) => {
        const l = lb();
        const a = attributes();
        const p = protections();
        const s = { EndTime: '2099-01-01T00:00:00Z', AutoRenew: 'ENABLED' };
        edit.lb?.(l);
        edit.attrs?.(a);
        edit.prot?.(p);
        edit.sub?.(s);
        return new FakeAws({
            'elbv2 describe-load-balancers': () => ({ LoadBalancers: [l] }),
            'elbv2 describe-load-balancer-attributes': () => ({ Attributes: a }),
            'shield list-protections': () => ({ Protections: p }),
            'shield describe-subscription': () => ({ Subscription: s }),
        });
    };

    for (const id of ['infra.alb.attached', 'infra.alb.attributes', 'infra.shield']) {
        it(`${id} passes as declared`, async () => {
            const outcome = await check(id).run(offlineCtx(aws()));
            assert.equal(outcome.status, 'pass', outcome.detail);
        });
    }

    const MUTATIONS: Array<[string, string, Parameters<typeof aws>[0], RegExp]> = [
        [
            'infra.alb.attached',
            'the load balancer becomes internal',
            { lb: (x) => (x.Scheme = 'internal') },
            /load balancer Scheme: got "internal", expected "internet-facing"/,
        ],
        [
            'infra.alb.attached',
            'it moves to another subnet',
            { lb: (x) => (x.AvailabilityZones[0].SubnetId = 'subnet-other') },
            /load balancer AvailabilityZones\[\d\]\.SubnetId: got "subnet-other"/,
        ],
        [
            'infra.alb.attached',
            'it gains a second security group',
            { lb: (x) => x.SecurityGroups.push('sg-other') },
            /load balancer SecurityGroups: extra \["sg-other"\]/,
        ],
        [
            'infra.alb.attributes',
            'the WAF fails open',
            { attrs: (x) => (x.find((a) => a.Key === 'waf.fail_open.enabled').Value = 'true') },
            /attribute waf\.fail_open\.enabled: got "true", expected "false"/,
        ],
        [
            'infra.alb.attributes',
            'desync mitigation is relaxed',
            { attrs: (x) => (x.find((a) => a.Key === 'routing.http.desync_mitigation_mode').Value = 'monitor') },
            /attribute routing\.http\.desync_mitigation_mode: got "monitor", expected "defensive"/,
        ],
        [
            'infra.alb.attributes',
            'a new attribute appears',
            { attrs: (x) => x.push({ Key: 'routing.http.new_feature.enabled', Value: 'true' }) },
            /attribute routing\.http\.new_feature\.enabled: got "true", expected absent/,
        ],
        [
            'infra.shield',
            'a protection gains a health check',
            { prot: (x) => (x[0].HealthCheckIds = ['hc-1']) },
            /protection-0 HealthCheckIds: got \["hc-1"\], expected absent/,
        ],
        [
            'infra.shield',
            'automatic response is disabled',
            { prot: (x) => (x[1].ApplicationLayerAutomaticResponseConfiguration = { Status: 'DISABLED' }) },
            /protection-1 ApplicationLayerAutomaticResponseConfiguration\.Status: got "DISABLED", expected "ENABLED"/,
        ],
        [
            'infra.shield',
            'the subscription stops auto-renewing',
            { sub: (x) => (x.AutoRenew = 'DISABLED') },
            /subscription auto-renew: got "DISABLED", expected "ENABLED"/,
        ],
    ];
    for (const [id, what, edit, pattern] of MUTATIONS) {
        it(`${id} fails when ${what}`, async () => {
            const outcome = await check(id).run(offlineCtx(aws(edit)));
            assert.equal(outcome.status, 'fail', outcome.detail);
            assert.match(outcome.detail ?? '', pattern);
        });
    }
});
