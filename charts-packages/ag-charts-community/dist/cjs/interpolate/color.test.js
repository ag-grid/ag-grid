"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var color_1 = require("../util/color");
var color_2 = require("./color");
test('string colors', function () {
    {
        var a = '#000';
        var b = '#fff';
        var i = color_2.default(a, b);
        expect(i(0.5)).toBe('rgb(128, 128, 128)');
        expect(i(0)).toBe('rgb(0, 0, 0)');
        expect(i(1)).toBe('rgb(255, 255, 255)');
    }
    {
        var a = '#00000000';
        var b = '#ffffffff';
        var i = color_2.default(a, b);
        expect(i(0.5)).toBe('rgba(128, 128, 128, 0.5)');
        expect(i(0)).toBe('rgba(0, 0, 0, 0)');
        expect(i(1)).toBe('rgb(255, 255, 255)');
    }
});
test('Color instances', function () {
    {
        var a = color_1.Color.fromArray([0, 0, 0]);
        var b = color_1.Color.fromArray([1, 1, 1]);
        var i = color_2.default(a, b);
        expect(i(0.5)).toBe('rgb(128, 128, 128)');
        expect(i(0)).toBe('rgb(0, 0, 0)');
        expect(i(1)).toBe('rgb(255, 255, 255)');
    }
    {
        var a = color_1.Color.fromArray([0, 0, 0, 0]);
        var b = color_1.Color.fromArray([1, 1, 1, 1]);
        var i = color_2.default(a, b);
        expect(i(0.5)).toBe('rgba(128, 128, 128, 0.5)');
        expect(i(0)).toBe('rgba(0, 0, 0, 0)');
        expect(i(1)).toBe('rgb(255, 255, 255)');
    }
});
test('Mixed case', function () {
    {
        var a = color_1.Color.fromArray([0, 0, 0]);
        var b = '#fff';
        var i = color_2.default(a, b);
        expect(i(0.5)).toBe('rgb(128, 128, 128)');
        expect(i(0)).toBe('rgb(0, 0, 0)');
        expect(i(1)).toBe('rgb(255, 255, 255)');
    }
    {
        var a = '#00000000';
        var b = color_1.Color.fromArray([1, 1, 1, 1]);
        var i = color_2.default(a, b);
        expect(i(0.5)).toBe('rgba(128, 128, 128, 0.5)');
        expect(i(0)).toBe('rgba(0, 0, 0, 0)');
        expect(i(1)).toBe('rgb(255, 255, 255)');
    }
});
test('Invalid start', function () {
    {
        var a = '!!!';
        var b = '#fff';
        var i = color_2.default(a, b);
        expect(i(0.5)).toBe('rgb(128, 128, 128)');
        expect(i(0)).toBe('rgb(0, 0, 0)');
        expect(i(1)).toBe('rgb(255, 255, 255)');
    }
});
test('Invalid end', function () {
    {
        var a = '#00000000';
        var b = '!!!';
        var i = color_2.default(a, b);
        expect(i(0.5)).toBe('rgba(0, 0, 0, 0.5)');
        expect(i(0)).toBe('rgba(0, 0, 0, 0)');
        expect(i(1)).toBe('rgb(0, 0, 0)');
    }
});
//# sourceMappingURL=color.test.js.map