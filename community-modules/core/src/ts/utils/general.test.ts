import { _ } from './general';

describe('serializeDateToYyyyMmDd', () => {
    it('returns null if no date supplied', () => {
        expect(_.serializeDateToYyyyMmDd(null)).toBeNull();
    });

    it('serialises dates using hyphen by default', () => {
        const date = new Date(2020, 2, 7);
        const result = _.serializeDateToYyyyMmDd(date);

        expect(result).toBe('2020-03-07');
    });

    it('can use a different delimiter', () => {
        const date = new Date(2020, 2, 27);
        const result = _.serializeDateToYyyyMmDd(date, '/');

        expect(result).toBe('2020/03/27');
    });
});

describe('parseYyyyMmDdToDate', () => {
    it('can parse date using default hyphen separator', () => {
        const value = '2020-03-27';
        const result = _.parseYyyyMmDdToDate(value);

        expect(result).toStrictEqual(new Date(2020, 2, 27));
    });

    it('can parse date using provided separator', () => {
        const value = '2020/03/07';
        const result = _.parseYyyyMmDdToDate(value, '/');

        expect(result).toStrictEqual(new Date(2020, 2, 7));
    });

    it('returns null if no value supplied', () => {
        expect(_.parseYyyyMmDdToDate(null)).toBeNull();
    });

    it('returns null if invalid value supplied', () => {
        expect(_.parseYyyyMmDdToDate('2017-03')).toBeNull();
    });
});