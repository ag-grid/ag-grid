import { expect, describe, it } from '@jest/globals';
import { TimeScale } from './timeScale';

describe('TimeScale', () => {
    it('should create nice domain', () => {
        const scale = new TimeScale();
        scale.domain = [new Date(new Date(2022, 1, 13)), new Date(new Date(2022, 10, 30))];
        scale.nice = true;
        scale.update();
        expect(scale.niceDomain).toEqual([new Date(2022, 1, 1), new Date(2022, 11, 1)]);
    });

    it('should create nice ticks', () => {
        const scale = new TimeScale();
        scale.domain = [new Date(2022, 1, 13), new Date(2022, 10, 30)];
        scale.nice = true;
        scale.tickCount = 10;
        expect(scale.ticks()).toEqual([
            new Date(2022, 1, 1),
            new Date(2022, 2, 1),
            new Date(2022, 3, 1),
            new Date(2022, 4, 1),
            new Date(2022, 5, 1),
            new Date(2022, 6, 1),
            new Date(2022, 7, 1),
            new Date(2022, 8, 1),
            new Date(2022, 9, 1),
            new Date(2022, 10, 1),
            new Date(2022, 11, 1),
        ]);
    });

    describe('#calculateDefaultTickFormat', () => {
        const TEST_CASES: { name: string; ticks: Date[]; expectedFormat: string }[] = [
            {
                name: 'several seconds',
                ticks: [
                    new Date('01 Jan 2020 13:25:30 GMT'),
                    new Date('01 Jan 2020 13:25:35 GMT'),
                    new Date('01 Jan 2020 13:25:40 GMT'),
                ],
                expectedFormat: ':%S', //  second
            },
            {
                name: 'several minutes',
                ticks: [
                    new Date('01 Jan 2020 13:25:00 GMT'),
                    new Date('01 Jan 2020 13:26:00 GMT'),
                    new Date('01 Jan 2020 13:27:00 GMT'),
                ],
                expectedFormat: '%I:%M', // hour:minute
            },
            {
                name: 'several hours',
                ticks: [
                    new Date('01 Jan 2020 13:00:00 GMT'),
                    new Date('01 Jan 2020 15:00:00 GMT'),
                    new Date('01 Jan 2020 17:00:00 GMT'),
                ],
                expectedFormat: '%I %p', // hour
            },
            {
                name: 'several days',
                ticks: [
                    new Date('01 Jan 2020 00:00:00 GMT'),
                    new Date('02 Jan 2020 00:00:00 GMT'),
                    new Date('03 Jan 2020 00:00:00 GMT'),
                ],
                expectedFormat: '%b %d', // short month
            },
            {
                name: 'several months',
                ticks: [
                    new Date('01 Jan 2020 00:00:00 GMT'),
                    new Date('01 Feb 2020 00:00:00 GMT'),
                    new Date('01 Mar 2020 00:00:00 GMT'),
                ],
                expectedFormat: '%B', // full month
            },
            {
                name: 'several years',
                ticks: [
                    new Date('01 Jan 2020 00:00:00 GMT'),
                    new Date('01 Jan 2021 00:00:00 GMT'),
                    new Date('01 Jan 2022 00:00:00 GMT'),
                ],
                expectedFormat: '%Y', // year
            },
            {
                name: 'several seconds spanning minutes',
                ticks: [
                    new Date('01 Jan 2020 13:25:00 GMT'),
                    new Date('01 Jan 2020 13:26:30 GMT'),
                    new Date('01 Jan 2020 13:27:00 GMT'),
                ],
                expectedFormat: '%I:%M:%S', // hour:minute:second
            },
            {
                name: 'several minutes spanning hours',
                ticks: [
                    new Date('01 Jan 2020 13:25:00 GMT'),
                    new Date('01 Jan 2020 15:25:00 GMT'),
                    new Date('01 Jan 2020 17:25:00 GMT'),
                ],
                expectedFormat: '%I %p%I:%M', // hour:minute [ '%I:%M', '%I %p' ] ---> not good
            },
            {
                name: 'several hours spanning days',
                ticks: [
                    new Date('01 Jan 2020 12:00:00 GMT'),
                    new Date('02 Jan 2020 00:00:00 GMT'),
                    new Date('02 Jan 2020 12:00:00 GMT'),
                    new Date('03 Jan 2020 00:00:00 GMT'),
                ],
                expectedFormat: '%I %p %b %d', // hour + short month + day
            },
            {
                name: 'several days spanning months',
                ticks: [
                    new Date('30 Jan 2020 00:00:00 GMT'),
                    new Date('31 Jan 2020 00:00:00 GMT'),
                    new Date('01 Jan 2020 00:00:00 GMT'),
                ],
                expectedFormat: '%b %d', // short month + day
            },
            {
                name: 'several months spanning years',
                ticks: [
                    new Date('01 Jan 2020 00:00:00 GMT'),
                    new Date('01 Feb 2020 00:00:00 GMT'),
                    new Date('01 Jan 2021 00:00:00 GMT'),
                ],
                expectedFormat: '%B %Y', // full month and year
            },
        ];

        it.each(TEST_CASES.map((c) => c.name))(`for %s case`, (caseName) => {
            const next = TEST_CASES.find((c) => c.name === caseName)!;

            const scale = new TimeScale();
            scale.domain = [next.ticks[0], next.ticks[next.ticks.length - 1]];

            expect(scale.calculateDefaultTickFormat(next.ticks)).toEqual(next.expectedFormat);
        });
    });
});
