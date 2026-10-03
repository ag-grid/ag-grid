import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { cloudfrontChecks } from '../checks/cloudfront';
import { wafChecks } from '../checks/waf';
import {
    DENIED,
    FakeAws,
    NO_CREDENTIALS,
    NO_SUCH_DISTRIBUTION,
    WAF_NONEXISTENT,
    cfAclHandlers,
    healthyCloudFront,
    offlineCtx,
} from '../testing/fakes';
import { awsErrorFromStderr } from './aws';
import { exitCode, runAll } from './runner';
import type { CheckDef } from './types';

const byId = (checks: CheckDef[], ...ids: string[]): CheckDef[] =>
    ids.map((id) => {
        const check = checks.find((c) => c.id === id);
        assert.ok(check, `no check ${id}`);
        return check;
    });

describe('AWS error classification', () => {
    const cases: Array<[string, string]> = [
        [
            'denied',
            'An error occurred (AccessDenied) when calling X: ... is not authorized to perform: cloudfront:GetFunction',
        ],
        ['credentials', 'Unable to locate credentials. You can configure credentials by running "aws configure".'],
        ['credentials', 'An error occurred (ExpiredToken) when calling the GetWebACL operation: expired'],
        ['throttled', 'An error occurred (ThrottlingException) when calling the GetWebACL operation: Rate exceeded'],
        ['unavailable', 'Could not connect to the endpoint URL: "https://cloudfront.amazonaws.com/"'],
        ['unavailable', 'An error occurred (ServiceUnavailable) when calling the GetDistribution operation'],
        ['missing', 'An error occurred (NoSuchDistribution) when calling the GetDistributionConfig operation'],
        ['missing', 'An error occurred (WAFNonexistentItemException) when calling the GetWebACL operation'],
        ['missing', 'An error occurred (ResourceNotFoundException) when calling the DescribeLogGroups operation'],
        ['other', 'An error occurred (ValidationException) when calling the GetWebACL operation: bad id'],
    ];
    for (const [kind, stderr] of cases) {
        it(`${kind}: ${stderr.slice(0, 60)}`, () => {
            const e = awsErrorFromStderr('svc', 'op', stderr);
            assert.equal(e.kind, kind);
            assert.equal(e.unverifiable, ['denied', 'credentials', 'throttled', 'unavailable'].includes(kind));
        });
    }
});

describe('missing AWS resources', () => {
    const cloudfront = byId(
        cloudfrontChecks(),
        'cloudfront.behaviours.order',
        'cloudfront.behaviours.negotiated-pages-uncached'
    );
    const waf = byId(wafChecks(), 'waf-config.cf.rules', 'waf-config.cf.mta-sts', 'waf-config.cf.logging');

    it('a missing distribution fails its checks, and --strict exits non-zero', async () => {
        const aws = new FakeAws({
            ...healthyCloudFront(),
            'cloudfront get-distribution': NO_SUCH_DISTRIBUTION,
            'cloudfront get-distribution-config': NO_SUCH_DISTRIBUTION,
        });
        const results = await runAll(cloudfront, offlineCtx(aws), 2);
        assert.deepEqual(
            results.map((r) => r.status),
            ['fail', 'fail']
        );
        assert.match(results[0].detail ?? '', /declared resource missing/);
        assert.equal(exitCode(results, true), 1);
        assert.equal(exitCode(results, false), 1);
    });

    it('a missing web ACL fails its checks, and --strict exits non-zero', async () => {
        const aws = new FakeAws({ 'wafv2 get-web-acl': WAF_NONEXISTENT });
        const results = await runAll(waf, offlineCtx(aws), 2);
        assert.deepEqual(
            results.map((r) => r.status),
            ['fail', 'fail', 'fail']
        );
        assert.equal(exitCode(results, true), 1);
    });

    it('an ACL with no logging configuration fails the logging check', async () => {
        const aws = new FakeAws({ ...cfAclHandlers(), 'wafv2 get-logging-configuration': WAF_NONEXISTENT });
        const [result] = await runAll(byId(wafChecks(), 'waf-config.cf.logging'), offlineCtx(aws), 1);
        assert.equal(result.status, 'fail');
        assert.equal(exitCode([result], true), 1);
    });

    for (const [why, failure] of [
        ['denied', DENIED('cloudfront:GetDistributionConfig')],
        ['unusable credentials', NO_CREDENTIALS],
    ] as const) {
        it(`a read that cannot be made (${why}) is unverifiable, not a failure`, async () => {
            const aws = new FakeAws({ 'cloudfront get-distribution-config': failure, 'wafv2 get-web-acl': failure });
            const results = await runAll([...cloudfront, ...waf], offlineCtx(aws), 2);
            assert.deepEqual(new Set(results.map((r) => r.status)), new Set(['skip']));
            assert.equal(exitCode(results, true), 0);
        });
    }
});
