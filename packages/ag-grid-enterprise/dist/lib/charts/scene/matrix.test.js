// ag-grid-enterprise v20.2.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var matrix_1 = require("./matrix");
test('multiply', function () {
    var A = new matrix_1.Matrix([1, 2, 3, 4, 5, 6]);
    var B = new matrix_1.Matrix([1, 4, 2, 5, 3, 6]);
    var C = A.multiply(B);
    expect(C).not.toEqual(A);
    expect(C.a).toBe(13);
    expect(C.b).toBe(18);
    expect(C.c).toBe(17);
    expect(C.d).toBe(24);
    expect(C.e).toBe(26);
    expect(C.f).toBe(36);
});
test('multiplySelf', function () {
    var A = new matrix_1.Matrix([1, 2, 3, 4, 5, 6]);
    var B = new matrix_1.Matrix([1, 4, 2, 5, 3, 6]);
    var C = A.multiplySelf(B);
    expect(C).toEqual(A);
    expect(C.a).toBe(13);
    expect(C.b).toBe(18);
    expect(C.c).toBe(17);
    expect(C.d).toBe(24);
    expect(C.e).toBe(26);
    expect(C.f).toBe(36);
});
test('preMultiplySelf', function () {
    var A = new matrix_1.Matrix([1, 2, 3, 4, 5, 6]);
    var B = new matrix_1.Matrix([1, 4, 2, 5, 3, 6]);
    var C = A.preMultiplySelf(B);
    expect(C).toEqual(A);
    expect(C.a).toBe(5);
    expect(C.b).toBe(14);
    expect(C.c).toBe(11);
    expect(C.d).toBe(32);
    expect(C.e).toBe(20);
    expect(C.f).toBe(56);
});
test('inverse', function () {
    var A = new matrix_1.Matrix([1, 2, 3, 4, 5, 6]);
    var iA = A.inverse();
    expect(iA).not.toEqual(A);
    expect(iA.a).toBe(-2);
    expect(iA.b).toBe(1);
    expect(iA.c).toBe(1.5);
    expect(iA.d).toBe(-0.5);
    expect(iA.e).toBe(1);
    expect(iA.f).toBe(-2);
});
test('invertSelf', function () {
    var A = new matrix_1.Matrix([1, 2, 3, 4, 5, 6]);
    var iA = A.invertSelf();
    expect(iA).toEqual(A);
    expect(iA.a).toBe(-2);
    expect(iA.b).toBe(1);
    expect(iA.c).toBe(1.5);
    expect(iA.d).toBe(-0.5);
    expect(iA.e).toBe(1);
    expect(iA.f).toBe(-2);
});
