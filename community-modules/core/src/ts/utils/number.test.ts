import { sum } from './number';

describe('sum', () => {
    it.each([
        [[1, 2, 3], 6],
        [[123, 456, 789], 1368],
        [[-123, 456, -789], -456],
        [[1.1, 2.2, 3.3, 4.4, 5.5], 16.5]
    ])('returns sum of values: %s', (values, total) => {
        expect(sum(values)).toBe(total);
    });

    it('returns null if values is null', () => {
        expect(sum(null)).toBeNull();
    });
});
