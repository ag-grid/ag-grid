import { expect, describe, it } from '@jest/globals';
import day from '../util/time/day';
import {
    durationDay,
    durationHour,
    durationMinute,
    durationMonth,
    durationWeek,
    durationYear,
} from '../util/time/duration';
import hour from '../util/time/hour';
import minute from '../util/time/minute';
import month from '../util/time/month';
import year from '../util/time/year';
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

    describe('should create ticks with configured', () => {
        describe(`milliseconds interval`, () => {
            const scale = new TimeScale();
            scale.nice = true;

            const MILLISECONDS_INTERVALS = [
                {
                    name: 'every minute',
                    interval: durationMinute,
                    domain: [new Date(2022, 0, 1, 12), new Date(2022, 0, 1, 13)],
                },
                {
                    name: 'every hour',
                    interval: durationHour,
                    domain: [new Date(2022, 0, 1, 9), new Date(2022, 0, 1, 17)],
                },
                {
                    name: 'every half day',
                    interval: durationDay / 2,
                    domain: [new Date(2022, 0, 1), new Date(2022, 0, 15)],
                },
                {
                    name: 'every 2 days',
                    interval: durationDay * 2,
                    domain: [new Date(2022, 0, 1), new Date(2022, 0, 21)],
                },
                {
                    name: 'every 3 weeks',
                    interval: durationWeek * 3,
                    domain: [new Date(2022, 0, 1), new Date(2022, 6, 1)],
                },
                {
                    name: 'every month',
                    interval: durationMonth,
                    domain: [new Date(2022, 0, 1), new Date(2023, 0, 1)],
                },
                {
                    name: 'every two months',
                    interval: durationMonth * 2,
                    domain: [new Date(2022, 0, 1), new Date(2023, 0, 1)],
                },
                {
                    name: 'every year',
                    interval: durationYear,
                    domain: [new Date(2021, 0, 1), new Date(2023, 0, 1)],
                },
            ];

            it.each(MILLISECONDS_INTERVALS.map((c) => c.name))(`for %s case`, (caseName) => {
                const { interval, domain } = MILLISECONDS_INTERVALS.find((c) => c.name === caseName);
                const scale = new TimeScale();

                scale.range = [0, 600];
                scale.domain = domain;
                scale.interval = interval;

                console.log(interval);
                expect(scale.ticks()).toMatchSnapshot();
            });
        });

        describe(`time interval`, () => {
            const scale = new TimeScale();
            scale.nice = true;

            const TIME_INTERVALS = [
                {
                    name: 'every minute',
                    interval: minute,
                    domain: [new Date(2022, 0, 1, 12), new Date(2022, 0, 1, 13)],
                },
                {
                    name: 'every hour',
                    interval: hour,
                    domain: [new Date(2022, 0, 1, 9), new Date(2022, 0, 1, 17)],
                },
                {
                    name: 'every day',
                    interval: day,
                    domain: [new Date(2022, 0, 1), new Date(2022, 0, 15)],
                },
                {
                    name: 'every 3 days',
                    interval: day.every(3),
                    domain: [new Date(2022, 0, 1), new Date(2022, 0, 21)],
                },
                {
                    name: 'every month',
                    interval: month,
                    domain: [new Date(2022, 0, 1), new Date(2022, 6, 1)],
                },
                {
                    name: 'every two months',
                    interval: month.every(2),
                    domain: [new Date(2022, 0, 1), new Date(2023, 0, 1)],
                },
                {
                    name: 'every 6 months',
                    interval: month.every(6),
                    domain: [new Date(2021, 0, 1), new Date(2023, 0, 1)],
                },
                {
                    name: 'every year',
                    interval: year,
                    domain: [new Date(2021, 0, 1), new Date(2023, 0, 1)],
                },
            ];

            it.each(TIME_INTERVALS.map((c) => c.name))(`for %s case`, (caseName) => {
                const { interval, domain } = TIME_INTERVALS.find((c) => c.name === caseName);
                const scale = new TimeScale();

                scale.range = [0, 600];
                scale.domain = domain;
                scale.interval = interval;

                expect(scale.ticks()).toMatchSnapshot();
            });
        });
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
                expectedFormat: '%I %p %b %d', // hour + short month + date
            },
            {
                name: 'several days spanning months',
                ticks: [new Date(2022, 0, 30), new Date(2022, 0, 31), new Date(2022, 2, 1), new Date(2022, 2, 2)],
                expectedFormat: '%b %d', // short month + date
            },
            {
                name: 'several days across years',
                ticks: [new Date(2022, 11, 28), new Date(2022, 11, 30), new Date(2023, 0, 2), new Date(2023, 0, 4)],
                expectedFormat: '%b %d %Y', // short month + date + year
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
