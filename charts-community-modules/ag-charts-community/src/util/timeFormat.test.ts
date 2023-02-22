import { expect, it, describe } from '@jest/globals';
import { buildFormatter } from './timeFormat';

describe('Date/Time Formatting', () => {
    const DEFAULT_DATE = new Date(Date.UTC(2019, 8, 3, 14, 50, 17, 300));
    // Falls on a Tuesday.
    const FIRST_DAY_OF_2019 = new Date(Date.UTC(2019, 0, 1, 13, 51, 16, 200));
    // Falls on a Monday.
    const FIRST_DAY_OF_2018 = new Date(Date.UTC(2018, 0, 1, 11, 12, 13, 100));
    // Falls on a Sunday.
    const FIRST_DAY_OF_2017 = new Date(Date.UTC(2017, 0, 1, 11, 12, 13, 100));

    const cases = [
        ['short text', '%a %-d %b, %y', 'Tue 3 Sep, 19'],
        ['long text', '%A %d %B, %Y', 'Tuesday 03 September, 2019'],
        ['locale date + time', '%c', '9/3/2019, 3:50:17 PM'],
        ['precise time', '%H:%M:%S.%L', '15:50:17.300'],
        ['super-precise time', '%H:%M:%S.%f', '15:50:17.300000'],
        ['am/pm', '%I:%M %p', '03:50 PM'],
        ['UNIX milliseconds', '%Q', '1567522217300'],
        ['UNIX seconds', '%s', '1567522217'],
        ['days of year', '%j', '246'],
        ['days of year (1st day)', '%j', '001', FIRST_DAY_OF_2019],
        ['weeks of year (Sunday-based)', '%U', '35'],
        ['weeks of year (Sunday-based) 1st Jan 2019', '%U', '00', FIRST_DAY_OF_2019],
        ['weeks of year (Sunday-based) 1st Jan 2018', '%U', '00', FIRST_DAY_OF_2018],
        ['weeks of year (Sunday-based) 1st Jan 2017', '%U', '01', FIRST_DAY_OF_2017],
        ['weeks of year (Monday-based)', '%W', '35'],
        ['weeks of year (Monday-based) 1st Jan 2019', '%W', '00', FIRST_DAY_OF_2019],
        ['weeks of year (Monday-based) 1st Jan 2018', '%W', '01', FIRST_DAY_OF_2018],
        ['weeks of year (Monday-based) 1st Jan 2017', '%W', '00', FIRST_DAY_OF_2017],
        ['weeks of year (ISO-based)', '%V', '36'],
        ['weeks of year (ISO-based) 1st Jan 2019', '%V', '01', FIRST_DAY_OF_2019],
        ['weeks of year (ISO-based) 1st Jan 2018', '%V', '01', FIRST_DAY_OF_2018],
        ['weeks of year (ISO-based) 1st Jan 2017', '%V', '52', FIRST_DAY_OF_2017],
        ['timezone offset', '%Z', '+0100'],
        ['locale date', '%x', '9/3/2019'],
        ['locale time', '%X', '3:50:17 PM'],
        ['% escape', '100%%', '100%'],
        ['default padding', '%A, %d %B, %Y - %H:%M:%S.%L', 'Tuesday, 03 September, 2019 - 15:50:17.300'],
        ['0 padding', '%A, %0d %B, %Y - %H:%M:%S.%L', 'Tuesday, 03 September, 2019 - 15:50:17.300'],
        ['space padding', '%A, %_d %B, %Y - %H:%M:%S.%L', 'Tuesday,  3 September, 2019 - 15:50:17.300'],
        ['null padding', '%A, %-d %B, %Y - %H:%M:%S.%L', 'Tuesday, 3 September, 2019 - 15:50:17.300'],
        ['invalid formatters', '%T%n', 'Tn'],
    ];

    it('should be using Europe/London timezone', () => {
        // If this test fails, check that process.env.TZ is set to Europe/London in jest.setup.js.
        expect(DEFAULT_DATE.getTimezoneOffset()).toEqual(-60);
    });

    describe('buildFormatter', () => {
        it.each(cases)('%s', (_, format, expected, date = DEFAULT_DATE) => {
            const formatter = buildFormatter(format);
            expect(formatter(date)).toStrictEqual(expected);
        });
    });
});
