import { _isValidDate, _isValidDateTime, _parseDateTimeFromString, _serialiseDate } from './date';

describe('_serialiseDate', () => {
    it('returns null if no date is supplied', () => {
        expect(_serialiseDate(null)).toBeNull();
    });

    it('serialises dates using hyphen by default', () => {
        const date = new Date(2020, 2, 27, 14, 22, 19);
        const result = _serialiseDate(date);

        expect(result).toBe('2020-03-27T14:22:19');
    });

    it('can serialise with a different separator', () => {
        const date = new Date(2020, 2, 27, 14, 22, 19);
        const result = _serialiseDate(date, true, ' ');

        expect(result).toBe('2020-03-27 14:22:19');
    });

    it('pads parts to two digits', () => {
        const date = new Date(2020, 2, 4, 3, 7, 2);
        const result = _serialiseDate(date, true);

        expect(result).toBe('2020-03-04T03:07:02');
    });

    it('will not include time if instructed', () => {
        const date = new Date(2020, 2, 27, 14, 22, 19);
        const result = _serialiseDate(date, false);

        expect(result).toBe('2020-03-27');
    });
});

describe('_parseDateTimeFromString', () => {
    it('can parse date', () => {
        const value = '2020-03-27';
        const result = _parseDateTimeFromString(value);

        expect(result).toStrictEqual(new Date(2020, 2, 27));
    });

    it.each([null, '2017', '2017-', '2017-03', '2017-03-', '2017-00-04', '2017-13-05', '2017-02-30'])(
        'returns null if invalid value supplied: %s',
        (value) => {
            expect(_parseDateTimeFromString(value)).toBeNull();
        }
    );

    it('can parse date with time', () => {
        const value = '2020-03-30T14:19:34Z';
        const result = _parseDateTimeFromString(value);

        expect(result).toStrictEqual(new Date(2020, 2, 30, 14, 19, 34));
    });

    it('ignores out-of-range but well-shaped time parts', () => {
        const result = _parseDateTimeFromString('2020-03-30T25:61:61');

        expect(result).toStrictEqual(new Date(2020, 2, 30));
    });

    it('returns null for a malformed time portion', () => {
        expect(_parseDateTimeFromString('2020-03-30T-1:-1:-1')).toBeNull();
    });
});

describe('isValidDateTime', () => {
    it('returns true for valid date time', () => {
        const date = '2020-03-30T14:19:34Z';
        expect(_isValidDateTime(date)).toBe(true);
    });

    it.each(['2020-03-30T14:19:34', '2020-03-30T14:19:34+00:00', '2020-03-30T14:19:34+01:00'])(
        'returns true for valid date time with different formats: %s',
        (date) => {
            expect(_isValidDateTime(date)).toBe(true);
        }
    );
    it.each(['2020-03-30T25:61:61Z', null, undefined, '', '2020-03-30', '2020-03-30T14:19:345'])(
        'returns false for invalid date time: %s',
        (date) => {
            expect(_isValidDateTime(date)).toBe(false);
        }
    );
});

describe('isValidDate', () => {
    it('returns true for valid date', () => {
        expect(_isValidDate('2020-03-30')).toBe(true);
    });

    it.each(['invalid', '', null, undefined, '2020/03/30', '30-01-2020'])(
        'returns false for invalid date: %s',
        (date) => {
            expect(_isValidDate(date)).toBe(false);
        }
    );

    it.each(['2025-05-23T11-08-35.rtf', '2025-05-23 invoice', '2020-03-30-extra', '2020-03-30T14:19:345'])(
        'returns false for a date prefix followed by non-time content: %s',
        (date) => {
            expect(_isValidDate(date)).toBe(false);
        }
    );

    it.each([
        '2020-03-30T14:19',
        '2020-03-30T14:19:34',
        '2020-03-30T14:19:34Z',
        '2020-03-30T14:19:34.123',
        '2020-03-30T14:19:34.123Z',
        '2020-03-30T14:19:34+00:00',
        '2020-03-30T14:19:34+01:00',
        '2020-03-30T25:61:61',
    ])('returns true for a well-shaped time portion (range-permissive): %s', (date) => {
        expect(_isValidDate(date)).toBe(true);
    });
});
