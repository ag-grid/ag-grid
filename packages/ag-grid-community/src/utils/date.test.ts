import { _isValidDate, _isValidDateTime } from './date';

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
});
