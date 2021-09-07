import { describe, expect, test, it } from "@jest/globals";
import { isNumber, isContinuous } from "./value";

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
    expect(isNumber({
        valueOf: () => 0
    })).toBe(false);
});

test('isContinuous', () => {
    expect(isContinuous(1)).toBe(true);
    expect(isContinuous(0)).toBe(true);
    expect(isContinuous(-1)).toBe(true);
    expect(isContinuous(new Date())).toBe(true);
    expect(isContinuous(+(new Date()))).toBe(true);
    expect(isContinuous({
        valueOf: () => 5
    })).toBe(true);
    expect(isContinuous({
        valueOf: () => ''
    })).toBe(false);
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