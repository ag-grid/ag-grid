import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { ALARMS } from '../expected/edge';
import { FakeAws, offlineCtx } from '../testing/fakes';
import { infraChecks } from './infra';

describe('infra.alarm dimensions', () => {
    const exp = ALARMS.find((a) => a.name === 'www-5xx-rate')!;
    const check = infraChecks().find((c) => c.id === `infra.alarm.${exp.name}`)!;
    const run = (extra: Array<{ Name: string; Value: string }> = []) =>
        check.run(
            offlineCtx(
                new FakeAws({
                    'cloudwatch describe-alarms': () => ({
                        MetricAlarms: [
                            {
                                AlarmName: exp.name,
                                ActionsEnabled: true,
                                AlarmActions: [`arn:aws:sns:us-east-1:000000000000:${exp.topic}`],
                                Namespace: exp.namespace,
                                MetricName: exp.metric,
                                Dimensions: [
                                    ...Object.entries(exp.dimensions ?? {}).map(([Name, Value]) => ({ Name, Value })),
                                    ...extra,
                                ],
                                ComparisonOperator: exp.comparison,
                                Threshold: exp.threshold,
                            },
                        ],
                    }),
                })
            )
        );

    it('passes on exactly the declared dimensions', async () => {
        const outcome = await run();
        assert.equal(outcome.status, 'pass', outcome.detail);
    });

    it('fails when an extra dimension makes it watch another metric', async () => {
        const outcome = await run([{ Name: 'Stage', Value: 'nowhere' }]);
        assert.equal(outcome.status, 'fail', outcome.detail);
        assert.match(outcome.detail ?? '', /Stage/);
    });
});
