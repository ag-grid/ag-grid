import { _parseBigIntOrNull } from './bigInt';

describe('_parseBigIntOrNull', () => {
    it('returns bigint for decimal strings', () => {
        expect(_parseBigIntOrNull('0')).toBe(0n);
        expect(_parseBigIntOrNull('123')).toBe(123n);
        expect(_parseBigIntOrNull('-42')).toBe(-42n);
        expect(_parseBigIntOrNull('+7')).toBe(7n);
        expect(_parseBigIntOrNull('0010')).toBe(10n);
    });

    it('accepts optional trailing n suffix', () => {
        expect(_parseBigIntOrNull('500n')).toBe(500n);
        expect(_parseBigIntOrNull('-12n')).toBe(-12n);
    });

    it('rejects non-integer formats', () => {
        expect(_parseBigIntOrNull('')).toBeNull();
        expect(_parseBigIntOrNull('   ')).toBeNull();
        expect(_parseBigIntOrNull('1.2')).toBeNull();
        expect(_parseBigIntOrNull('1e5')).toBeNull();
        expect(_parseBigIntOrNull('0x10')).toBeNull();
        expect(_parseBigIntOrNull('0b10')).toBeNull();
        expect(_parseBigIntOrNull('12a')).toBeNull();
        expect(_parseBigIntOrNull('n')).toBeNull();
        expect(_parseBigIntOrNull('+')).toBeNull();
        expect(_parseBigIntOrNull('-')).toBeNull();
        expect(_parseBigIntOrNull('10nn')).toBeNull();
    });

    it('handles bigint input', () => {
        expect(_parseBigIntOrNull(999n)).toBe(999n);
    });
});
