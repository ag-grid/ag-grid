import { Color } from "../util/color";
import color from "./color";
test('string colors', function () {
    {
        var a = '#000';
        var b = '#fff';
        var i = color(a, b);
        expect(i(0.5)).toBe('rgb(128, 128, 128)');
        expect(i(0)).toBe('rgb(0, 0, 0)');
        expect(i(1)).toBe('rgb(255, 255, 255)');
    }
    {
        var a = '#00000000';
        var b = '#ffffffff';
        var i = color(a, b);
        expect(i(0.5)).toBe('rgba(128, 128, 128, 0.5)');
        expect(i(0)).toBe('rgba(0, 0, 0, 0)');
        expect(i(1)).toBe('rgb(255, 255, 255)');
    }
});
test('Color instances', function () {
    {
        var a = Color.fromArray([0, 0, 0]);
        var b = Color.fromArray([1, 1, 1]);
        var i = color(a, b);
        expect(i(0.5)).toBe('rgb(128, 128, 128)');
        expect(i(0)).toBe('rgb(0, 0, 0)');
        expect(i(1)).toBe('rgb(255, 255, 255)');
    }
    {
        var a = Color.fromArray([0, 0, 0, 0]);
        var b = Color.fromArray([1, 1, 1, 1]);
        var i = color(a, b);
        expect(i(0.5)).toBe('rgba(128, 128, 128, 0.5)');
        expect(i(0)).toBe('rgba(0, 0, 0, 0)');
        expect(i(1)).toBe('rgb(255, 255, 255)');
    }
});
test('Mixed case', function () {
    {
        var a = Color.fromArray([0, 0, 0]);
        var b = '#fff';
        var i = color(a, b);
        expect(i(0.5)).toBe('rgb(128, 128, 128)');
        expect(i(0)).toBe('rgb(0, 0, 0)');
        expect(i(1)).toBe('rgb(255, 255, 255)');
    }
    {
        var a = '#00000000';
        var b = Color.fromArray([1, 1, 1, 1]);
        var i = color(a, b);
        expect(i(0.5)).toBe('rgba(128, 128, 128, 0.5)');
        expect(i(0)).toBe('rgba(0, 0, 0, 0)');
        expect(i(1)).toBe('rgb(255, 255, 255)');
    }
});
test('Invalid start', function () {
    {
        var a = '!!!';
        var b = '#fff';
        var i = color(a, b);
        expect(i(0.5)).toBe('rgb(128, 128, 128)');
        expect(i(0)).toBe('rgb(0, 0, 0)');
        expect(i(1)).toBe('rgb(255, 255, 255)');
    }
});
test('Invalid end', function () {
    {
        var a = '#00000000';
        var b = '!!!';
        var i = color(a, b);
        expect(i(0.5)).toBe('rgba(0, 0, 0, 0.5)');
        expect(i(0)).toBe('rgba(0, 0, 0, 0)');
        expect(i(1)).toBe('rgb(0, 0, 0)');
    }
});
