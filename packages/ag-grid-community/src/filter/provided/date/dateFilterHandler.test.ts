import type { ISimpleFilterModelPresetType } from '../iSimpleFilter';
import { DateFilterHandler, presetDateFilterTypeRelativeFromToMap } from './dateFilterHandler';

describe('presetDateFilterTypeRelativeFromToMap', () => {
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

    describe.each([
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
    describe.each([
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
        it('works', () => expect(presetDateFilterTypeRelativeFromToMap[fnName](FROM).toString()).toContain(expected))
    );
});

describe('getOrRefreshRangeCacheItem', () => {
    const key = 'today' as ISimpleFilterModelPresetType;

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(0));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('returns cached range for the same key before expiry', () => {
        const handler = new DateFilterHandler();
        const rangeFn = jest.fn(() => [new Date(1), new Date(2)] as [Date, Date]);

        const first = handler.getOrRefreshRangeCacheItem(key, rangeFn);
        const second = handler.getOrRefreshRangeCacheItem(key, rangeFn);

        expect(rangeFn).toHaveBeenCalledTimes(1);
        expect(first[0]).toBe(second[0]);
        expect(first[1]).toBe(second[1]);
    });

    it('refreshes the cache when expired', () => {
        const handler = new DateFilterHandler();
        const rangeFn = jest
            .fn()
            .mockImplementationOnce(() => [new Date(1), new Date(2)] as [Date, Date])
            .mockImplementationOnce(() => [new Date(3), new Date(4)] as [Date, Date]);

        const first = handler.getOrRefreshRangeCacheItem(key, rangeFn);

        jest.setSystemTime(new Date(86_400_001));

        const second = handler.getOrRefreshRangeCacheItem(key, rangeFn);

        expect(rangeFn).toHaveBeenCalledTimes(2);
        expect(first.from).not.toBe(second.from);
        expect(first.to).not.toBe(second.to);
        expect([second.from, second.to].map((date) => date.getTime())).toStrictEqual([3, 4]);
    });

    it('keeps separate caches per key', () => {
        const handler = new DateFilterHandler();
        const rangeFnToday = jest.fn(() => [new Date(10), new Date(20)] as [Date, Date]);
        const rangeFnYesterday = jest.fn(() => [new Date(30), new Date(40)] as [Date, Date]);

        const today = handler.getOrRefreshRangeCacheItem('today', rangeFnToday);
        const yesterday = handler.getOrRefreshRangeCacheItem('yesterday', rangeFnYesterday);

        expect(rangeFnToday).toHaveBeenCalledTimes(1);
        expect(rangeFnYesterday).toHaveBeenCalledTimes(1);
        expect([today.from, today.to].map((date) => date.getTime())).toStrictEqual([10, 20]);
        expect([yesterday.from, yesterday.to].map((date) => date.getTime())).toStrictEqual([30, 40]);
    });
});
