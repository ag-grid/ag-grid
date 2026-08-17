import { _formatNumberCommas } from './number';

const localeFunc =
    (thousandSeparator?: string, decimalSeparator?: string) => () => (key: string, defaultValue: string) => {
        if (key === 'thousandSeparator') {
            return thousandSeparator ?? defaultValue;
        }
        if (key === 'decimalSeparator') {
            return decimalSeparator ?? defaultValue;
        }
        return defaultValue;
    };

describe('_formatNumberCommas', () => {
    test('groups only the integer part', () => {
        expect(_formatNumberCommas(0.123456, localeFunc(',', '.'))).toBe('0.123456');
        expect(_formatNumberCommas(1234.5678, localeFunc('.', ','))).toBe('1.234,5678');
    });

    test('groups integers unchanged', () => {
        expect(_formatNumberCommas(1234567, localeFunc(',', '.'))).toBe('1,234,567');
        expect(_formatNumberCommas(0, localeFunc(',', '.'))).toBe('0');
    });

    test('short fractions are unaffected', () => {
        expect(_formatNumberCommas(1234.5, localeFunc('.', ','))).toBe('1.234,5');
        expect(_formatNumberCommas(0.123, localeFunc(',', '.'))).toBe('0.123');
    });

    test('negatives group the integer part only', () => {
        expect(_formatNumberCommas(-1234.5678, localeFunc(',', '.'))).toBe('-1,234.5678');
    });

    test('exponential notation is left alone', () => {
        expect(_formatNumberCommas(1.2345e-7, localeFunc(',', '.'))).toBe('1.2345e-7');
    });

    test('non-numbers format as an empty string', () => {
        expect(_formatNumberCommas(null, localeFunc(',', '.'))).toBe('');
    });

    test('falls back to the default separators when the locale supplies none', () => {
        expect(_formatNumberCommas(1234.5678, localeFunc())).toBe('1,234.5678');
    });
});
