import { serialiseDate, parseDateTimeFromString } from './date';

describe('serialiseDate', () => {
    it('returns null if no date is supplied', () => {
        expect(serialiseDate(null)).toBeNull();
    });

    it('serialises dates using hyphen by default', () => {
        const date = new Date(2020, 2, 27, 14, 22, 19);
        const result = serialiseDate(date);

        expect(result).toBe('2020-03-27 14:22:19');
    });

    it('can serialise with a different separator', () => {
        const date = new Date(2020, 2, 27, 14, 22, 19);
        const result = serialiseDate(date, true, '/');

        expect(result).toBe('2020/03/27 14:22:19');
    });

    it('pads parts to two digits', () => {
        const date = new Date(2020, 2, 4, 3, 7, 2);
        const result = serialiseDate(date, true, '/');

        expect(result).toBe('2020/03/04 03:07:02');
    });

    it('will not include time if instructed', () => {
        const date = new Date(2020, 2, 27, 14, 22, 19);
        const result = serialiseDate(date, false);

        expect(result).toBe('2020-03-27');
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
