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
                    new Date(2023, 0, 1, 13, 25, 30),
                    new Date(2023, 0, 1, 13, 25, 35),
                    new Date(2023, 0, 1, 13, 25, 40),
                    new Date(2023, 0, 1, 13, 25, 45),
                ],
                expectedFormat: ':%S', //  second
            },
            {
                name: 'several minutes',
                ticks: [
                    new Date(2023, 0, 1, 13, 25),
                    new Date(2023, 0, 1, 13, 26),
                    new Date(2023, 0, 1, 13, 27),
                    new Date(2023, 0, 1, 13, 28),
                ],
                expectedFormat: '%I:%M', // hour:minute
            },
            {
                name: 'several hours',
                ticks: [
                    new Date(2023, 0, 1, 13),
                    new Date(2023, 0, 1, 15),
                    new Date(2023, 0, 1, 17),
                    new Date(2023, 0, 1, 19),
                ],
                expectedFormat: '%I %p', // hour
            },
            {
                name: 'several days',
                ticks: [new Date(2022, 0, 1), new Date(2022, 0, 2), new Date(2022, 0, 3)],
                expectedFormat: '%a', // week day
            },
            {
                name: 'several months',
                ticks: [new Date(2022, 0, 1), new Date(2022, 1, 1), new Date(2022, 2, 1)],
                expectedFormat: '%B', // full month
            },
            {
                name: 'several years',
                ticks: [new Date(2021, 0, 1), new Date(2022, 0, 1), new Date(2023, 0, 1)],
                expectedFormat: '%Y', // year
            },
            {
                name: 'several seconds spanning minutes',
                ticks: [
                    new Date(2023, 0, 1, 13, 25, 0),
                    new Date(2023, 0, 1, 13, 25, 30),
                    new Date(2023, 0, 1, 13, 26, 0),
                    new Date(2023, 0, 1, 13, 26, 30),
                    new Date(2023, 0, 1, 13, 27, 0),
                ],
                expectedFormat: '%I:%M:%S', // hour:minute:second
            },
            {
                name: 'several minutes spanning hours',
                ticks: [new Date(2023, 0, 1, 13, 25), new Date(2023, 0, 1, 15, 25), new Date(2023, 0, 1, 17, 25)],
                expectedFormat: '%I %p%I:%M',
            },
            {
                name: 'several hours spanning days',
                ticks: [
                    new Date(2023, 0, 1, 12),
                    new Date(2023, 0, 2, 0),
                    new Date(2023, 0, 2, 12),
                    new Date(2023, 0, 3, 0),
                ],
                expectedFormat: '%I %p %a', // hour + week day
            },
            {
                name: 'several hours spanning weeks',
                ticks: [
                    new Date(2023, 0, 1, 12),
                    new Date(2023, 0, 2, 0),
                    new Date(2023, 0, 2, 12),
                    new Date(2023, 0, 14, 0),
                ],
                expectedFormat: '%I %p %d %b', // hour + date + short month
            },
            {
                name: 'several days spanning months',
                ticks: [new Date(2022, 0, 30), new Date(2022, 0, 31), new Date(2022, 2, 1), new Date(2022, 2, 2)],
                expectedFormat: '%d %b', // date + short month
            },
            {
                name: 'several days across years',
                ticks: [new Date(2022, 11, 28), new Date(2022, 11, 30), new Date(2023, 0, 2), new Date(2023, 0, 4)],
                expectedFormat: '%d %b', // date + short month
            },
            {
                name: 'several months spanning years',
                ticks: [
                    new Date(2022, 0, 1),
                    new Date(2022, 3, 1),
                    new Date(2022, 6, 1),
                    new Date(2022, 9, 1),
                    new Date(2023, 0, 1),
                ],
                expectedFormat: '%B %Y', // full month + year
            },
            {
                name: 'several months across years',
                ticks: [new Date(2022, 10, 1), new Date(2022, 11, 1), new Date(2023, 0, 1)],
                expectedFormat: '%B %Y', // full month + year
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
