import { describe, expect, test } from "@jest/globals";
import { format, formatDecimalParts, formatNumerals } from "./numberFormat";
import { LinearScale } from "../scale/linearScale";

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

describe('format', () => {
    describe('percent', () => {
        test('multiply by 100 and add %', () => {
            const f = format('.0%');
            expect(f(0.3)).toBe('30%');
            expect(f(40)).toBe('4000%');
        });
    });
    describe('SI-prefix', () => {
        test('Formatted value should have 3 significant digits followed by a unit', () => {
            const f = format('.3s');
            console.log(f(43e6));
            expect(f(43e6)).toBe('43.0M');
        });
        test('Test scale format', () => {
            const scale = new LinearScale();
            const f = scale.tickFormat(10, '.3s');
        });
    });
});
