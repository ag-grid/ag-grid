import { expect, test } from '@jest/globals';
import { Matrix } from './matrix';

test('multiply', () => {
    const A = new Matrix([1, 2, 3, 4, 5, 6]);
    const B = new Matrix([1, 4, 2, 5, 3, 6]);

    const C = A.multiply(B);

    expect(C).not.toEqual(A);

    expect(C.e[0]).toBe(13);
    expect(C.e[1]).toBe(18);
    expect(C.e[2]).toBe(17);
    expect(C.e[3]).toBe(24);
    expect(C.e[4]).toBe(26);
    expect(C.e[5]).toBe(36);
});

test('multiplySelf', () => {
    const A = new Matrix([1, 2, 3, 4, 5, 6]);
    const B = new Matrix([1, 4, 2, 5, 3, 6]);

    const C = A.multiplySelf(B);

    expect(C).toEqual(A);

    expect(C.e[0]).toBe(13);
    expect(C.e[1]).toBe(18);
    expect(C.e[2]).toBe(17);
    expect(C.e[3]).toBe(24);
    expect(C.e[4]).toBe(26);
    expect(C.e[5]).toBe(36);
});

test('preMultiplySelf', () => {
    const A = new Matrix([1, 2, 3, 4, 5, 6]);
    const B = new Matrix([1, 4, 2, 5, 3, 6]);

    const C = A.preMultiplySelf(B);

    expect(C).toEqual(A);

    expect(C.e[0]).toBe(5);
    expect(C.e[1]).toBe(14);
    expect(C.e[2]).toBe(11);
    expect(C.e[3]).toBe(32);
    expect(C.e[4]).toBe(20);
    expect(C.e[5]).toBe(56);
});

test('inverse', () => {
    const A = new Matrix([1, 2, 3, 4, 5, 6]);
    const iA = A.inverse();

    expect(iA).not.toEqual(A);

    expect(iA.e[0]).toBe(-2);
    expect(iA.e[1]).toBe(1);
    expect(iA.e[2]).toBe(1.5);
    expect(iA.e[3]).toBe(-0.5);
    expect(iA.e[4]).toBe(1);
    expect(iA.e[5]).toBe(-2);
});

test('invertSelf', () => {
    const A = new Matrix([1, 2, 3, 4, 5, 6]);
    const iA = A.invertSelf();

    expect(iA).toEqual(A);

    expect(iA.e[0]).toBe(-2);
    expect(iA.e[1]).toBe(1);
    expect(iA.e[2]).toBe(1.5);
    expect(iA.e[3]).toBe(-0.5);
    expect(iA.e[4]).toBe(1);
    expect(iA.e[5]).toBe(-2);
});
