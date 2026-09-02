import type { ISimpleFilterModelPresetType } from '../iSimpleFilter';
import {
    RelativeDateRangeCache,
    presetDateFilterTypeRelativeFromToMap,
    relativeDateHelperFns,
} from './relativeDateRanges';

type PresetKey = keyof typeof presetDateFilterTypeRelativeFromToMap;
type HelperKey = keyof typeof relativeDateHelperFns;

describe('relative date ranges', () => {
    beforeAll(() => {
        if (typeof navigator === 'undefined') {
            return;
        }

        Object.defineProperty(navigator, 'language', { configurable: true, value: 'en-GB' });
        Object.defineProperty(navigator, 'languages', { configurable: true, value: ['en-GB'] });
    });

    const BASE = 'Wed Apr 08 2020 12:34:56 GMT+0000 (Coordinated Universal Time)';

    const ANSWERS = {
        startOfTodayMinus24months: 'Sun Apr 08 2018 00:00:00 GMT+0000 (Coordinated Universal Time)',
        startOfPreviousYear: 'Tue Jan 01 2019 00:00:00 GMT+0000 (Coordinated Universal Time)',
        startOfTodayMinus12months: 'Mon Apr 08 2019 00:00:00 GMT+0000 (Coordinated Universal Time)',
        startOfTodayMinus6months: 'Tue Oct 08 2019 00:00:00 GMT+0000 (Coordinated Universal Time)',
        startOfCurrentYear: 'Wed Jan 01 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
        startOfPreviousQuarter: 'Wed Jan 01 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
        startOfTodayMinus90days: 'Thu Jan 09 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
        startOfPreviousMonth: 'Sun Mar 01 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
        startOfTodayMinus30days: 'Mon Mar 09 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
        startOfPreviousWeek: 'Mon Mar 30 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
        previousMonth: 'Tue Mar 31 2020',
        previousQuarter: 'Tue Mar 31 2020',
        startOfCurrentQuarter: 'Wed Apr 01 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
        startOfCurrentMonth: 'Wed Apr 01 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
        startOfTodayMinus7days: 'Wed Apr 01 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
        previousWeek: 'Sun Apr 05 2020',
        startOfCurrentWeek: 'Mon Apr 06 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
        startOfYesterday: 'Tue Apr 07 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
        previousDay: 'Tue Apr 07 2020',
        startOfToday: 'Wed Apr 08 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
        startOfTomorrow: 'Thu Apr 09 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
        startOfDayAfterTomorrow: 'Fri Apr 10 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
        startOfNextWeek: 'Mon Apr 13 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
        startOfWeekAfterNext: 'Mon Apr 20 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
        startOfNextMonth: 'Fri May 01 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
        startOfMonthAfterNext: 'Mon Jun 01 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
        startOfNextQuarter: 'Wed Jul 01 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
        startOfQuarterAfterNext: 'Thu Oct 01 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
        startOfNextYear: 'Fri Jan 01 2021 00:00:00 GMT+0000 (Coordinated Universal Time)',
        startOfYearAfterNext: 'Sat Jan 01 2022 00:00:00 GMT+0000 (Coordinated Universal Time)',
    };

    let FROM: Date;
    let TO: Date;

    beforeEach(() => {
        [FROM, TO] = [new Date(BASE), new Date(BASE)];
    });

    it('validate answers', () =>
        Object.values(ANSWERS).forEach((date, index, arr) => {
            if (arr[index + 1] && new Date(date) > new Date(arr[index + 1])) {
                expect(''.toString()).toBe(`${date.toString()} <= ${arr[index + 1].toString()}`);
            }
        }));

    describe.each<[PresetKey, string[]]>([
        ['today', [ANSWERS.startOfToday, ANSWERS.startOfTomorrow]],
        ['yesterday', [ANSWERS.startOfYesterday, ANSWERS.startOfToday]],
        ['tomorrow', [ANSWERS.startOfTomorrow, ANSWERS.startOfDayAfterTomorrow]],
        ['thisWeek', [ANSWERS.startOfCurrentWeek, ANSWERS.startOfNextWeek]],
        ['lastWeek', [ANSWERS.startOfPreviousWeek, ANSWERS.startOfCurrentWeek]],
        ['nextWeek', [ANSWERS.startOfNextWeek, ANSWERS.startOfWeekAfterNext]],
        ['thisMonth', [ANSWERS.startOfCurrentMonth, ANSWERS.startOfNextMonth]],
        ['lastMonth', [ANSWERS.startOfPreviousMonth, ANSWERS.startOfCurrentMonth]],
        ['nextMonth', [ANSWERS.startOfNextMonth, ANSWERS.startOfMonthAfterNext]],
        ['thisQuarter', [ANSWERS.startOfCurrentQuarter, ANSWERS.startOfNextQuarter]],
        ['lastQuarter', [ANSWERS.startOfPreviousQuarter, ANSWERS.startOfCurrentQuarter]],
        ['nextQuarter', [ANSWERS.startOfNextQuarter, ANSWERS.startOfQuarterAfterNext]],
        ['thisYear', [ANSWERS.startOfCurrentYear, ANSWERS.startOfNextYear]],
        ['lastYear', [ANSWERS.startOfPreviousYear, ANSWERS.startOfCurrentYear]],
        ['nextYear', [ANSWERS.startOfNextYear, ANSWERS.startOfYearAfterNext]],
        ['yearToDate', [ANSWERS.startOfCurrentYear, ANSWERS.startOfTomorrow]],
        ['last7Days', [ANSWERS.startOfTodayMinus7days, ANSWERS.startOfTomorrow]],
        ['last30Days', [ANSWERS.startOfTodayMinus30days, ANSWERS.startOfTomorrow]],
        ['last90Days', [ANSWERS.startOfTodayMinus90days, ANSWERS.startOfTomorrow]],
        ['last6Months', [ANSWERS.startOfTodayMinus6months, ANSWERS.startOfTomorrow]],
        ['last12Months', [ANSWERS.startOfTodayMinus12months, ANSWERS.startOfTomorrow]],
        ['last24Months', [ANSWERS.startOfTodayMinus24months, ANSWERS.startOfTomorrow]],
    ])('%s', (fnName, expected) =>
        it('returns correct from/to', () =>
            expect(
                presetDateFilterTypeRelativeFromToMap[fnName](FROM, TO).map((d: Date) => d.toString())
            ).toStrictEqual(expected))
    );
    describe.each<[HelperKey, string]>([
        ['setStartOfDay', ANSWERS.startOfToday],
        ['setStartOfWeek', ANSWERS.startOfCurrentWeek],
        ['setStartOfNextDay', ANSWERS.startOfTomorrow],
        ['setStartOfNextWeek', ANSWERS.startOfNextWeek],
        ['setStartOfMonth', ANSWERS.startOfCurrentMonth],
        ['setStartOfNextMonth', ANSWERS.startOfNextMonth],
        ['setStartOfQuarter', ANSWERS.startOfCurrentQuarter],
        ['setStartOfNextQuarter', ANSWERS.startOfNextQuarter],
        ['setStartOfYear', ANSWERS.startOfCurrentYear],
        ['setStartOfNextYear', ANSWERS.startOfNextYear],
        ['setPreviousDay', ANSWERS.previousDay],
        ['setPreviousWeek', ANSWERS.previousWeek],
        ['setPreviousMonth', ANSWERS.previousMonth],
        ['setPreviousQuarter', ANSWERS.previousQuarter],
    ])('%s', (fnName, expected) =>
        it('works', () => expect(relativeDateHelperFns[fnName](FROM).toString()).toContain(expected))
    );
});

describe('getFirstDayOfWeek', () => {
    const base = new Date('2020-04-08T12:34:56.000Z');
    const originalLocale = (Intl as any).Locale;
    const originalNavigator = typeof navigator === 'undefined' ? undefined : navigator;

    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        (Intl as any).Locale = originalLocale;
        if (originalNavigator) {
            Object.defineProperty(globalThis, 'navigator', { configurable: true, value: originalNavigator });
        } else {
            delete (globalThis as any).navigator;
        }
    });

    it('uses Intl.Locale.getWeekInfo when available', async () => {
        const getWeekInfo = vi.fn(() => ({ firstDay: 0 }));
        class MockLocale {
            getWeekInfo() {
                return getWeekInfo();
            }
        }

        (Intl as any).Locale = MockLocale;
        Object.defineProperty(globalThis, 'navigator', {
            configurable: true,
            value: { language: 'en-US', languages: ['en-US'] },
        });

        const { relativeDateHelperFns: helpers } = await import('./relativeDateRanges');
        const result = helpers.setStartOfWeek(new Date(base));
        expect(result.toUTCString()).toContain('Sun, 05 Apr 2020');

        expect(getWeekInfo).toHaveBeenCalledTimes(1);
    });
});

describe('RelativeDateRangeCache', () => {
    const key = 'today' as ISimpleFilterModelPresetType;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(0));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // Start the clock away from midnight: at the epoch an expiry timestamp and an elapsed time are the same
    // number, so a cache that never hits still looks like one that does.
    it.each([
        ['at the epoch', new Date(0), new Date(1000)],
        ['later the same day', new Date('2026-08-10T09:00:00Z'), new Date('2026-08-10T09:00:01Z')],
    ])('returns cached range for the same key before expiry, %s', (_name, start, next) => {
        vi.setSystemTime(start);
        const cache = new RelativeDateRangeCache();
        const rangeFn = vi.fn(() => [new Date(1), new Date(2)] as [Date, Date]);

        const first = cache.getRange(key, rangeFn);
        vi.setSystemTime(next);
        const second = cache.getRange(key, rangeFn);

        expect(rangeFn).toHaveBeenCalledTimes(1);
        expect([first.fromTime, first.toTime]).toStrictEqual([1, 2]);
        expect([second.fromTime, second.toTime]).toStrictEqual([1, 2]);
    });

    // The range reaches a user `comparator` as dates it is free to normalise, so the cache keeps times:
    // there is nothing in it a caller holds a reference to.
    it('caches times rather than the dates the range function built', () => {
        const cache = new RelativeDateRangeCache();
        const built: Date[] = [];
        const rangeFn = vi.fn(() => {
            const range: [Date, Date] = [new Date(1_000), new Date(2_000)];
            built.push(...range);
            return range;
        });

        const cached = cache.getRange(key, rangeFn);
        for (const date of built) {
            date.setTime(999_999);
        }

        expect(Object.values(cached).every((value) => typeof value === 'number')).toBe(true);
        expect([cached.fromTime, cached.toTime]).toStrictEqual([1_000, 2_000]);
    });

    // Built from local parts, since the expiry is the next *local* midnight: pinning the clock to a UTC
    // offset would put the boundary an hour out in any zone the suite is not run in.
    const MIDMORNING = new Date(2026, 7, 10, 9, 0, 0);
    const NEXT_MIDNIGHT = new Date(2026, 7, 11, 0, 0, 0);

    // The ranges are half-open, so the expiry instant already belongs to the day the cached range excludes.
    it('refreshes the cache at the instant it expires', () => {
        vi.setSystemTime(MIDMORNING);
        const cache = new RelativeDateRangeCache();
        const rangeFn = vi.fn(() => [new Date(1), new Date(2)] as [Date, Date]);

        cache.getRange(key, rangeFn);
        vi.setSystemTime(NEXT_MIDNIGHT);
        cache.getRange(key, rangeFn);

        expect(rangeFn).toHaveBeenCalledTimes(2);
    });

    it('refreshes the cache when expired', () => {
        vi.setSystemTime(MIDMORNING);
        const cache = new RelativeDateRangeCache();
        const rangeFn = vi
            .fn()
            .mockImplementationOnce(() => [new Date(1), new Date(2)] as [Date, Date])
            .mockImplementationOnce(() => [new Date(3), new Date(4)] as [Date, Date]);

        const first = cache.getRange(key, rangeFn);

        vi.setSystemTime(new Date(NEXT_MIDNIGHT.getTime() + 1));

        const second = cache.getRange(key, rangeFn);

        expect(rangeFn).toHaveBeenCalledTimes(2);
        expect([first.fromTime, first.toTime]).toStrictEqual([1, 2]);
        expect([second.fromTime, second.toTime]).toStrictEqual([3, 4]);
    });

    it('keeps separate caches per key', () => {
        const cache = new RelativeDateRangeCache();
        const rangeFnToday = vi.fn(() => [new Date(10), new Date(20)] as [Date, Date]);
        const rangeFnYesterday = vi.fn(() => [new Date(30), new Date(40)] as [Date, Date]);

        const today = cache.getRange('today', rangeFnToday);
        const yesterday = cache.getRange('yesterday', rangeFnYesterday);

        expect(rangeFnToday).toHaveBeenCalledTimes(1);
        expect(rangeFnYesterday).toHaveBeenCalledTimes(1);
        expect([today.fromTime, today.toTime]).toStrictEqual([10, 20]);
        expect([yesterday.fromTime, yesterday.toTime]).toStrictEqual([30, 40]);
    });
});
