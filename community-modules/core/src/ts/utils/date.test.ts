import { serialiseDate, serialiseTime, parseDateTimeFromString } from './date';

describe('serialiseDate', () => {
    it('returns null if no date is supplied', () => {
        expect(serialiseDate(null)).toBeNull();
    });

    it('serialises dates using hyphen by default', () => {
        const date = new Date(2020, 2, 7);
        const result = serialiseDate(date);

        expect(result).toBe('2020-03-07');
    });

    it('can serialise with a different separator', () => {
        const date = new Date(2020, 2, 27);
        const result = serialiseDate(date, '/');

        expect(result).toBe('2020/03/27');
    });
});

describe('serialiseTime', () => {
    it('returns null if no time is supplied', () => {
        expect(serialiseTime(null)).toBeNull();
    });

    it('returns colon separated time string', () => {
        const time = new Date(0, 0, 0, 14, 22, 19);

        expect(serialiseTime(time)).toBe('14:22:19');
    });

    it('pads all time parts to two digits', () => {
        const time = new Date(0, 0, 0, 4, 2, 9);

        expect(serialiseTime(time)).toBe('04:02:09');
    });
});

describe('parseDateTimeFromString', () => {
    it('can parse date', () => {
        const value = '2020-03-27';
        const result = parseDateTimeFromString(value);

        expect(result).toStrictEqual(new Date(2020, 2, 27));
    });

    it.each(
        [
            null,
            '2017',
            '2017-',
            '2017-03',
            '2017-03-',
            '2017-00-04',
            '2017-13-05',
            '2017-02-30'
        ])
        ('returns null if invalid value supplied: %s', value => {
            expect(parseDateTimeFromString(value)).toBeNull();
        });

    it('can parse date with time', () => {
        const value = '2020-03-30 14:19:34';
        const result = parseDateTimeFromString(value);

        expect(result).toStrictEqual(new Date(2020, 2, 30, 14, 19, 34));
    });

    it.each(
        [
            '25:61:61',
            '-1:-1:-1',
        ])
        ('ignores invalid time parts: %s', value => {
            const result = parseDateTimeFromString('2020-03-30 ' + value);

            expect(result).toStrictEqual(new Date(2020, 2, 30));
        });
});
