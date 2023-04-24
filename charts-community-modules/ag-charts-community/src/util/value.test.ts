import { expect, test } from '@jest/globals';
import { isNumber, isContinuous, isDiscrete } from './value';

test('isNumber', () => {
    expect(isNumber(1)).toBe(true);
    expect(isNumber(0)).toBe(true);
    expect(isNumber(-1)).toBe(true);
    expect(isNumber(Number(1))).toBe(true);
    expect(isNumber(Number('wow'))).toBe(false);
    expect(isNumber(Infinity)).toBe(false);
    expect(isNumber(-Infinity)).toBe(false);
    expect(isNumber(NaN)).toBe(false);
    expect(isNumber(null)).toBe(false);
    expect(isNumber(undefined)).toBe(false);
    expect(isNumber('1')).toBe(false);
    expect(isNumber({})).toBe(false);
    expect(isNumber([])).toBe(false);
    expect(isNumber('')).toBe(false);
    expect(
        isNumber({
            valueOf: () => 0,
        })
    ).toBe(false);
});

test('isContinuous', () => {
    expect(isContinuous(1)).toBe(true);
    expect(isContinuous(0)).toBe(true);
    expect(isContinuous(-1)).toBe(true);
    expect(isContinuous(new Date())).toBe(true);
    expect(isContinuous(+new Date())).toBe(true);
    expect(
        isContinuous({
            valueOf: () => 5,
        })
    ).toBe(true);
    expect(
        isContinuous({
            valueOf: () => '',
        })
    ).toBe(false);
    expect(isContinuous(NaN)).toBe(false);
    expect(isContinuous(null)).toBe(false);
    expect(isContinuous(undefined)).toBe(false);
    expect(isContinuous('')).toBe(false);
    expect(isContinuous([])).toBe(false);
    expect(isContinuous({})).toBe(false);
    expect(isContinuous(Symbol.iterator)).toBe(false);
    expect(isContinuous(Infinity)).toBe(false);
    expect(isContinuous(-Infinity)).toBe(false);
});

test('isDiscrete', () => {
    expect(isDiscrete({})).toBe(false);
    expect(isDiscrete([])).toBe(false);
    expect(isDiscrete(false)).toBe(false);
    expect(isDiscrete(true)).toBe(false);
    expect(isDiscrete(0)).toBe(false);
    expect(isDiscrete(1)).toBe(false);
    expect(isDiscrete(-1)).toBe(false);
    expect(isDiscrete(null)).toBe(false);
    expect(isDiscrete(NaN)).toBe(false);
    expect(isDiscrete(undefined)).toBe(false);
    expect(isDiscrete(Symbol.iterator)).toBe(false);
    expect(isDiscrete(Number(5))).toBe(false);
    expect(isDiscrete(String('hello'))).toBe(true);
    expect(isDiscrete('hello')).toBe(true);
    expect(
        isDiscrete({
            toString: () => 5,
        })
    ).toBe(false);
    expect(
        isDiscrete({
            toString: () => [],
        })
    ).toBe(false);
    expect(
        isDiscrete({
            toString: () => false,
        })
    ).toBe(false);
    expect(
        isDiscrete({
            toString: () => true,
        })
    ).toBe(false);
    expect(
        isDiscrete({
            toString: () => ({}),
        })
    ).toBe(false);
    expect(
        isDiscrete({
            toString: () => undefined,
        })
    ).toBe(false);
    expect(
        isDiscrete({
            toString: () => 'hello',
        })
    ).toBe(true);
    expect(
        isDiscrete({
            toString: () => String('hello'),
        })
    ).toBe(true);
});
