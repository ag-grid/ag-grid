import { expect, describe, it } from '@jest/globals';
import { TimeScale } from './timeScale';

describe('TimeScale', () => {
    describe('#calculateDefaultTickFormat', () => {
        const TEST_CASES: { name: string; ticks: Date[]; expectedFormat: string }[] = [
            {
                name: 'several minutes',
                ticks: [
                    new Date('01 Jan 2020 13:25:30 GMT'),
                    new Date('01 Jan 2020 13:26:30 GMT'),
                    new Date('01 Jan 2020 13:27:30 GMT'),
                ],
                expectedFormat: '%I %p%I:%M:%S',
            },
        ];

        it.each(TEST_CASES.map((c) => c.name))(`for %s case`, (caseName) => {
            const next = TEST_CASES.find((c) => c.name === caseName)!;

            const scale = new TimeScale();

            expect(scale.calculateDefaultTickFormat(next.ticks)).toEqual(next.expectedFormat);
        });
    });
});
