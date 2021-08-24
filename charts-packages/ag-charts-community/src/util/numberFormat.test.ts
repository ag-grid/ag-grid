import { describe, expect, test, it } from "@jest/globals";
import { format, formatDecimalParts, formatPrefix } from "./numberFormat";
import { LinearScale } from "../scale/linearScale";

describe('formatDecimalParts', () => {
    test('1.23', () => {
        const v = formatDecimalParts(1.23);
        expect(v && v[0]).toBe('123');
        expect(v && v[1]).toBe(0);
    });
    test('1.23, 5', () => {
        const v = formatDecimalParts(1.23, 5);
        expect(v && v[0]).toBe('12300');
        expect(v && v[1]).toBe(0);
    });
    test('1.23, 2', () => {
        const v = formatDecimalParts(1.23, 2);
        expect(v && v[0]).toBe('12');
        expect(v && v[1]).toBe(0);
    });
});

describe('formatPrefix', () => {
    const f = formatPrefix(',.0', 1e-6);
    expect(f(0.00042)).toBe('420µ');
    expect(f(0.0042)).toBe('4,200µ');
});

describe('format', () => {
    describe('fixed decimal', () => {
        it('should have one decimal point', () => {
            const f = format('.1f');
            expect(f(0.1 + 0.2)).toBe('0.3');
        });
    });
    describe('fixed decimal', () => {
        it('should have one decimal point', () => {
            const f = format('.1f');
            expect(f(0.1 + 0.2)).toBe('0.3');
        });
    });
    describe('rounded percentage', () => {
        const f = format('.0%');
        expect(f(0.3)).toBe('30%');
        expect(f(0.123)).toBe('12%');
        expect(f(40)).toBe('4000%');
    });
    describe('localized fixed-point currency', () => {
        expect(format('$.2f')(3.5)).toBe('$3.50');
    });
    describe('localized fixed-point currency', () => {
        expect(format('$.2f')(3.5)).toBe('$3.50');
    });
    describe('space-filled and signed', () => {
        // TODO: returns '+420000000000'
        expect(format('+20')(42)).toBe('                 +42');
    });
    describe('dot-filled and centered', () => {
        // TODO: returns '....420000000000....'
        expect(format('.^20')(42)).toBe('.........42.........');
    });
    describe('prefixed lowercase hexadecimal', () => {
        expect(format('#x')(48879)).toBe('0xbeef');
    });
    describe('grouped thousands with two significant digits', () => {
        expect(format(',.2r')(4223)).toBe('4,200');
    });
    describe('trim insignificant trailing zeros across format types', () => {
        expect(format('s')(1500)).toBe('1.50000k');
        expect(format('s')(-1500)).toBe('−1.5k'); // TODO: returns "−1.50000k"
    });
    describe('empty type is a shorthand for ~g', () => {
        expect(format('.2')(42)).toBe('42');
        expect(format('.2')(4.2)).toBe('4.2');
        expect(format('.1')(42)).toBe('4e+1');
        expect(format('.1')(4.2)).toBe('4');
    });
    describe('SI-prefix', () => {
        it('should have 3 digits followed by a unit', () => {
            const f = format('.3s');
            expect(f(43e6)).toBe('43.0M');
        });
        test('Test scale format', () => {
            const scale = new LinearScale();
            const f = scale.tickFormat(10, '.3s');
        });
    });

});
