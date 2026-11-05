import { extractPaired } from './pairedUtils';

describe('extractPaired', () => {
    test('undefined overrides give an undefined result', () => {
        expect(extractPaired(undefined, 'scatter')).toEqual({ paired: undefined, overrides: undefined });
    });

    test('returns the same object when there is no paired key', () => {
        const overrides = { scatter: { series: {} } } as any;
        const result = extractPaired(overrides, 'scatter');

        expect(result.paired).toBeUndefined();
        expect(result.overrides).toBe(overrides);
    });

    test('strips scatter.paired into a copy, keeping other keys and leaving the input untouched', () => {
        const overrides = { common: { padding: 1 }, scatter: { paired: false, title: 'x' } } as any;
        const result = extractPaired(overrides, 'scatter');

        expect(result.paired).toBe(false);
        expect(result.overrides).toEqual({ common: { padding: 1 }, scatter: { title: 'x' } });
        expect(result.overrides).not.toBe(overrides);
        expect(overrides).toEqual({ common: { padding: 1 }, scatter: { paired: false, title: 'x' } });
    });

    test.each([
        { chartType: 'bubble', expected: true },
        { chartType: 'scatter', expected: false },
    ] as const)('$chartType prefers its own key and strips both', ({ chartType, expected }) => {
        const overrides = { scatter: { paired: false }, bubble: { paired: true } } as any;
        const result = extractPaired(overrides, chartType);

        expect(result.paired).toBe(expected);
        expect(result.overrides).toEqual({ scatter: {}, bubble: {} });
    });

    test('strips a non-boolean paired value without returning it', () => {
        const result = extractPaired({ scatter: { paired: 'no' } } as any, 'scatter');

        expect(result.paired).toBeUndefined();
        expect(result.overrides).toEqual({ scatter: {} });
    });
});
