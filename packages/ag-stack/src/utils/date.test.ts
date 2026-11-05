import {
    _isValidDate,
    _isValidDateTime,
    _parseDateTimeFromString,
    _parseDateTimeWithOffset,
    _serialiseDate,
} from './date';

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

    it('pads a year before 100AD to four digits', () => {
        const date = new Date(2000, 0, 1);
        date.setFullYear(87);
        const result = _serialiseDate(date, false);

        expect(result).toBe('0087-01-01');
    });

    it('pads a three-digit year to four digits', () => {
        const date = new Date(2000, 0, 1);
        date.setFullYear(987);
        const result = _serialiseDate(date, false);

        expect(result).toBe('0987-01-01');
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

    it.each(['0087-01-01', '0000-01-01', '0987-06-15'])(
        'parses a year before 100AD without shifting into the 1900s: %s',
        (value) => {
            const result = _parseDateTimeFromString(value);
            const expectedYear = Number.parseInt(value.slice(0, 4), 10);

            expect(result).not.toBeNull();
            expect(result!.getFullYear()).toBe(expectedYear);
        }
    );

    it('parses the leap day of a leap year before 100AD (year 0 is a leap year)', () => {
        const result = _parseDateTimeFromString('0000-02-29');

        expect(result).not.toBeNull();
        expect(result!.getFullYear()).toBe(0);
        expect(result!.getMonth()).toBe(1);
        expect(result!.getDate()).toBe(29);
    });

    it('returns null for a February 29th in a non-leap year before 100AD', () => {
        expect(_parseDateTimeFromString('0001-02-29')).toBeNull();
    });

    it('round-trips a year before 100AD through serialise and parse', () => {
        const date = new Date(2000, 0, 1);
        date.setFullYear(87);

        const result = _parseDateTimeFromString(_serialiseDate(date, false));

        expect(result).not.toBeNull();
        expect(result!.getFullYear()).toBe(87);
        expect(result!.getMonth()).toBe(0);
        expect(result!.getDate()).toBe(1);
    });
});

describe('_parseDateTimeWithOffset', () => {
    it.each([
        ['2020-10-10T10:10:10Z', '2020-10-10T10:10:10.000Z'],
        ['2020-10-10 10:10:10Z', '2020-10-10T10:10:10.000Z'],
        ['2020-10-10T10:10:10.000Z', '2020-10-10T10:10:10.000Z'],
        ['2020-10-10T12:10:10+02:00', '2020-10-10T10:10:10.000Z'],
        ['2020-10-10T12:10:10+0200', '2020-10-10T10:10:10.000Z'],
        ['2020-10-10T12:10:10+02', '2020-10-10T10:10:10.000Z'],
        ['2020-10-10T05:10:10-05:00', '2020-10-10T10:10:10.000Z'],
        ['2020-10-10T15:40+05:30', '2020-10-10T10:10:00.000Z'],
    ])('reads %s as the instant it denotes', (value, expected) => {
        expect(_parseDateTimeWithOffset(value)!.toISOString()).toBe(expected);
    });

    it('ignores fractional seconds', () => {
        expect(_parseDateTimeWithOffset('2020-10-10T10:10:10.500Z')!.toISOString()).toBe('2020-10-10T10:10:10.000Z');
    });

    it('reads a time inside a local DST gap unchanged', () => {
        const gaps = ['2020-03-08T02:30:00Z', '2020-03-29T01:30:00Z'];
        expect(gaps.map((value) => _parseDateTimeWithOffset(value)!.toISOString().slice(0, 19) + 'Z')).toEqual(gaps);
    });

    it('does not shift a year before 100AD into the 1900s', () => {
        expect(_parseDateTimeWithOffset('0087-03-04T10:00:00Z')!.getUTCFullYear()).toBe(87);
    });

    it.each([
        '2020-02-30T10:10:10Z',
        '2020-10-10T24:00:00Z',
        '2020-10-10T10:60:00Z',
        '2020-10-10T10:10:60Z',
        '2020-10-10T10:10:10+24:00',
        '2020-10-10T10:10:10+02:60',
    ])('returns null for %s', (value) => {
        expect(_parseDateTimeWithOffset(value)).toBeNull();
    });

    it.each(['2020-10-10T10:10:10', '2020-10-10 10:10:10', '2020-10-10T10:10', '2020-10-10', 'not-a-date', '', null])(
        'matches _parseDateTimeFromString when there is no offset: %s',
        (value) => {
            expect(_parseDateTimeWithOffset(value)).toStrictEqual(_parseDateTimeFromString(value));
        }
    );

    it('round-trips the output of toISOString', () => {
        const date = new Date(2020, 9, 10, 10, 10, 10);
        expect(_parseDateTimeWithOffset(date.toISOString())).toStrictEqual(date);
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
