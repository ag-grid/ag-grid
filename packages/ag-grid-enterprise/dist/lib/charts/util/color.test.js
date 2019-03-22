// ag-grid-enterprise v20.2.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var color_1 = require("./color");
test('constructor', function () {
    {
        var color = new color_1.Color(-1, 1, -2, 3);
        expect(color.r).toBe(0);
        expect(color.g).toBe(1);
        expect(color.b).toBe(0);
        expect(color.a).toBe(1);
    }
    {
        var color = new color_1.Color(0.3, 0.4, 0.5);
        expect(color.r).toBe(0.3);
        expect(color.g).toBe(0.4);
        expect(color.b).toBe(0.5);
        expect(color.a).toBe(1);
    }
});
test('fromHexString', function () {
    {
        var color = color_1.Color.fromHexString('#abc');
        expect(color.r).toBe(0.6666666666666666);
        expect(color.g).toBe(0.7333333333333333);
        expect(color.b).toBe(0.8);
        expect(color.a).toBe(1);
    }
    {
        var color = color_1.Color.fromHexString('#aabbcc');
        expect(color.r).toBe(0.6666666666666666);
        expect(color.g).toBe(0.7333333333333333);
        expect(color.b).toBe(0.8);
        expect(color.a).toBe(1);
    }
    {
        var color = color_1.Color.fromHexString('#abcc');
        expect(color.r).toBe(0.6666666666666666);
        expect(color.g).toBe(0.7333333333333333);
        expect(color.b).toBe(0.8);
        expect(color.a).toBe(0.8);
    }
    {
        var color = color_1.Color.fromHexString('#aabbcccc');
        expect(color.r).toBe(0.6666666666666666);
        expect(color.g).toBe(0.7333333333333333);
        expect(color.b).toBe(0.8);
        expect(color.a).toBe(0.8);
    }
    expect(function () { color_1.Color.fromHexString(''); }).toThrow();
    expect(function () { color_1.Color.fromHexString('#'); }).toThrow();
    expect(function () { color_1.Color.fromHexString('#a'); }).toThrow();
    expect(function () { color_1.Color.fromHexString('#ab'); }).toThrow();
    expect(function () { color_1.Color.fromHexString('#abcde'); }).toThrow();
    expect(function () { color_1.Color.fromHexString('#aabbccd'); }).toThrow();
    expect(function () { color_1.Color.fromHexString('#aabbccddf'); }).toThrow();
});
test('fromArray', function () {
    {
        var color = color_1.Color.fromArray([0.1, 0.2, 0.3, 0.4]);
        expect(color.r).toBe(0.1);
        expect(color.g).toBe(0.2);
        expect(color.b).toBe(0.3);
        expect(color.a).toBe(0.4);
    }
    {
        var color = color_1.Color.fromArray([0.1, 0.2, 0.3]);
        expect(color.r).toBe(0.1);
        expect(color.g).toBe(0.2);
        expect(color.b).toBe(0.3);
        expect(color.a).toBe(1.0);
    }
});
test('toHSB', function () {
    {
        var color = new color_1.Color(0.2, 0.4, 0.6);
        var hsb = color.toHSB();
        expect(hsb[0]).toBe(210);
        expect(hsb[1]).toBe(0.6666666666666666);
        expect(hsb[2]).toBe(0.6);
    }
    {
        var color = new color_1.Color(0.3, 0.8, 0.5);
        var hsb = color.toHSB();
        expect(hsb[0]).toBe(144);
        expect(hsb[1]).toBe(0.625);
        expect(hsb[2]).toBe(0.8);
    }
    {
        var color = new color_1.Color(0.5, 0.5, 0.5);
        var hsb = color.toHSB();
        expect(hsb[0]).toBe(NaN);
        expect(hsb[1]).toBe(0.0);
        expect(hsb[2]).toBe(0.5);
    }
});
test('HSBtoRGB', function () {
    {
        var rgb = color_1.Color.HSBtoRGB(0.3, 0.8, 0.6);
        expect(rgb[0]).toBe(0.6);
        expect(rgb[1]).toBe(0.1224000000000001);
        expect(rgb[2]).toBe(0.11999999999999997);
    }
    {
        var rgb = color_1.Color.HSBtoRGB(0, 0.8, 0.6);
        expect(rgb[0]).toBe(0.6);
        expect(rgb[1]).toBe(0.11999999999999997);
        expect(rgb[2]).toBe(0.11999999999999997);
    }
    {
        var rgb = color_1.Color.HSBtoRGB(NaN, 0.8, 0.6);
        expect(rgb[0]).toBe(0.6);
        expect(rgb[1]).toBe(0.11999999999999997);
        expect(rgb[2]).toBe(0.11999999999999997);
    }
});
test('fromRgbaString', function () {
    {
        var color = color_1.Color.fromRgbaString('  rgb(120,240,100) ');
        expect(color.r).toBe(120 / 255);
        expect(color.g).toBe(240 / 255);
        expect(color.b).toBe(100 / 255);
        expect(color.toRgbaString()).toBe('rgb(120, 240, 100)');
    }
    {
        var color = color_1.Color.fromRgbaString('  rgba(120,   240,  100,    0.4) ');
        expect(color.r).toBe(120 / 255);
        expect(color.g).toBe(240 / 255);
        expect(color.b).toBe(100 / 255);
        expect(color.a).toBe(0.4);
        expect(color.toRgbaString()).toBe('rgba(120, 240, 100, 0.4)');
    }
    {
        var color = color_1.Color.fromRgbaString('  rgba(120,   340,  500,    2.4) ');
        expect(color.r).toBe(120 / 255);
        expect(color.g).toBe(1);
        expect(color.b).toBe(1);
        expect(color.a).toBe(1);
        expect(color.toRgbaString()).toBe('rgb(120, 255, 255)');
    }
    expect(function () { color_1.Color.fromRgbaString('rgb(120.5, 240, 100)'); }).toThrow();
    expect(function () { color_1.Color.fromRgbaString('rgb(120, .3, 100)'); }).toThrow();
    expect(function () { color_1.Color.fromRgbaString('rgb(120, 240, 100.)'); }).toThrow();
    expect(function () { color_1.Color.fromRgbaString('rgb(-120, 240, 100)'); }).toThrow();
});
