// ag-grid-enterprise v21.0.1
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var number_1 = require("./number");
test('toFixed', function () {
    expect(number_1.toFixed(0.000347985)).toBe('0.00035');
    expect(number_1.toFixed(234.000347985)).toBe('234.00');
    expect(number_1.toFixed(234.2343)).toBe('234.23');
    expect(number_1.toFixed(-0.0830894028175203)).toBe('-0.083');
});
test('toReadableNumber', function () {
    expect(number_1.toReadableNumber(10550000000)).toBe('10.55B');
    expect(number_1.toReadableNumber(-10550000000, 1)).toBe('-10.6B');
});
