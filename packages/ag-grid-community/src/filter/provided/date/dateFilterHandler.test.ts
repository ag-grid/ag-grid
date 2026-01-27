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

describe('DateFilterHandler refresh scheduling', () => {
    const BASE_TIME = new Date(2020, 3, 8, 23, 59, 10, 0);

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(BASE_TIME);
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('schedules refresh at the start of the next day', () => {
        const setTimeoutSpy = jest.spyOn(globalThis, 'setTimeout');

        // eslint-disable-next-line sonarjs/constructor-for-side-effects
        new DateFilterHandler();

        expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
        const [, delay] = setTimeoutSpy.mock.calls[0];
        expect(delay).toBe(50 * 1000);
    });

    it('reschedules for the next midnight after running', () => {
        const setTimeoutSpy = jest.spyOn(globalThis, 'setTimeout');

        // eslint-disable-next-line sonarjs/constructor-for-side-effects
        new DateFilterHandler();

        jest.advanceTimersByTime(50 * 1000);

        expect(setTimeoutSpy).toHaveBeenCalledTimes(2);
        const [, delay] = setTimeoutSpy.mock.calls[1];
        expect(delay).toBe(24 * 60 * 60 * 1000);
    });
});
