import { format, formatDecimalParts, formatNumerals } from "./numberFormat";

describe('formatDecimalParts', () => {
    test('1.23', () => {
        const result1 = formatDecimalParts(1.23);
        expect(result1 && result1[0]).toBe('123');
        expect(result1 && result1[1]).toBe(0);
    });
    test('1.23, 5', () => {
        const result1 = formatDecimalParts(1.23, 5);
        expect(result1 && result1[0]).toBe('12300');
        expect(result1 && result1[1]).toBe(0);
    });
    test('1.23, 2', () => {
        const result1 = formatDecimalParts(1.23, 2);
        expect(result1 && result1[0]).toBe('12');
        expect(result1 && result1[1]).toBe(0);
    });
});

describe('formatNumerals', () => {
    test('123456789', () => {
        const result = formatNumerals('000')('123456');
        // console.log(result);
    });
});

describe('format', () => {
    describe('percent', () => {
        test('multiply by 100 and add %', () => {
            const f = format('.0%');
            expect(f(0.3)).toBe('30%');
            expect(f(40)).toBe('4000%');
        });
    });
});
