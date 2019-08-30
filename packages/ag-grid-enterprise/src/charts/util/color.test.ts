import { Color } from "ag-grid-community";

test('constructor', () => {
    {
        const color = new Color(-1, 1, -2, 3);
        expect(color.r).toBe(0);
        expect(color.g).toBe(1);
        expect(color.b).toBe(0);
        expect(color.a).toBe(1);
    }
    {
        const color = new Color(0.3, 0.4, 0.5);
        expect(color.r).toBe(0.3);
        expect(color.g).toBe(0.4);
        expect(color.b).toBe(0.5);
        expect(color.a).toBe(1);
    }
});

test('fromHexString', () => {
    {
        const color = Color.fromHexString('#abc');
        expect(color.r).toBe(0.6666666666666666);
        expect(color.g).toBe(0.7333333333333333);
        expect(color.b).toBe(0.8);
        expect(color.a).toBe(1);
    }
    {
        const color = Color.fromHexString('#aabbcc');
        expect(color.r).toBe(0.6666666666666666);
        expect(color.g).toBe(0.7333333333333333);
        expect(color.b).toBe(0.8);
        expect(color.a).toBe(1);
    }
    {
        const color = Color.fromHexString('#abcc');
        expect(color.r).toBe(0.6666666666666666);
        expect(color.g).toBe(0.7333333333333333);
        expect(color.b).toBe(0.8);
        expect(color.a).toBe(0.8);
    }
    {
        const color = Color.fromHexString('#aabbcccc');
        expect(color.r).toBe(0.6666666666666666);
        expect(color.g).toBe(0.7333333333333333);
        expect(color.b).toBe(0.8);
        expect(color.a).toBe(0.8);
    }

    expect(() => { Color.fromHexString(''); }).toThrow();
    expect(() => { Color.fromHexString('#'); }).toThrow();
    expect(() => { Color.fromHexString('#a'); }).toThrow();
    expect(() => { Color.fromHexString('#ab'); }).toThrow();
    expect(() => { Color.fromHexString('#abcde'); }).toThrow();
    expect(() => { Color.fromHexString('#aabbccd'); }).toThrow();
    expect(() => { Color.fromHexString('#aabbccddf'); }).toThrow();
});

test('fromArray', () => {
    {
        const color = Color.fromArray([0.1, 0.2, 0.3, 0.4]);
        expect(color.r).toBe(0.1);
        expect(color.g).toBe(0.2);
        expect(color.b).toBe(0.3);
        expect(color.a).toBe(0.4);
    }
    {
        const color = Color.fromArray([0.1, 0.2, 0.3]);
        expect(color.r).toBe(0.1);
        expect(color.g).toBe(0.2);
        expect(color.b).toBe(0.3);
        expect(color.a).toBe(1.0);
    }
});

test('toHSB', () => {
    {
        const color = new Color(0.2, 0.4, 0.6);
        const hsb = color.toHSB();
        expect(hsb[0]).toBe(210);
        expect(hsb[1]).toBe(0.6666666666666666);
        expect(hsb[2]).toBe(0.6);
    }
    {
        const color = new Color(0.3, 0.8, 0.5);
        const hsb = color.toHSB();
        expect(hsb[0]).toBe(144);
        expect(hsb[1]).toBe(0.625);
        expect(hsb[2]).toBe(0.8);
    }
    {
        const color = new Color(0.5, 0.5, 0.5);
        const hsb = color.toHSB();
        expect(hsb[0]).toBe(NaN);
        expect(hsb[1]).toBe(0.0);
        expect(hsb[2]).toBe(0.5);
    }
});

test('HSBtoRGB', () => {
    {
        const rgb = Color.HSBtoRGB(0.3, 0.8, 0.6);
        expect(rgb[0]).toBe(0.6);
        expect(rgb[1]).toBe(0.1224000000000001);
        expect(rgb[2]).toBe(0.11999999999999997);
    }
    {
        const rgb = Color.HSBtoRGB(0, 0.8, 0.6);
        expect(rgb[0]).toBe(0.6);
        expect(rgb[1]).toBe(0.11999999999999997);
        expect(rgb[2]).toBe(0.11999999999999997);
    }
    {
        const rgb = Color.HSBtoRGB(NaN, 0.8, 0.6);
        expect(rgb[0]).toBe(0.6);
        expect(rgb[1]).toBe(0.11999999999999997);
        expect(rgb[2]).toBe(0.11999999999999997);
    }
});

test('fromRgbaString', () => {
    {
        const color = Color.fromRgbaString('  rgb(120,240,100) ');
        expect(color.r).toBe(120 / 255);
        expect(color.g).toBe(240 / 255);
        expect(color.b).toBe(100 / 255);
        expect(color.a).toBe(1);
        expect(color.toRgbaString()).toBe('rgb(120, 240, 100)');
    }
    {
        const color = Color.fromRgbaString('  rgba(120,   240,  100,    0.4) ');
        expect(color.r).toBe(120 / 255);
        expect(color.g).toBe(240 / 255);
        expect(color.b).toBe(100 / 255);
        expect(color.a).toBe(0.4);
        expect(color.toRgbaString()).toBe('rgba(120, 240, 100, 0.4)');
    }
    {
        const color = Color.fromRgbaString('  rgba(120,   340,  500,    2.4) ');
        expect(color.r).toBe(120 / 255);
        expect(color.g).toBe(1);
        expect(color.b).toBe(1);
        expect(color.a).toBe(1);
        expect(color.toRgbaString()).toBe('rgb(120, 255, 255)');
    }
    expect(() => { Color.fromRgbaString('rgb(120.5, 240, 100)'); }).toThrow();
    expect(() => { Color.fromRgbaString('rgb(120, .3, 100)'); }).toThrow();
    expect(() => { Color.fromRgbaString('rgb(120, 240, 100.)'); }).toThrow();
    expect(() => { Color.fromRgbaString('rgb(-120, 240, 100)'); }).toThrow();
});

test('fromString', () => {
    {
        const color = Color.fromString('#abc');
        expect(color.r).toBe(0.6666666666666666);
        expect(color.g).toBe(0.7333333333333333);
        expect(color.b).toBe(0.8);
        expect(color.a).toBe(1);
    }
    {
        const color = Color.fromString('#ff00ff');
        expect(color.r).toBe(1);
        expect(color.g).toBe(0);
        expect(color.b).toBe(1);
        expect(color.a).toBe(1);
    }
    {
        const color = Color.fromString('rgb(120, 240, 100)');
        expect(color.r).toBe(120 / 255);
        expect(color.g).toBe(240 / 255);
        expect(color.b).toBe(100 / 255);
        expect(color.a).toBe(1);
        expect(color.toRgbaString()).toBe('rgb(120, 240, 100)');
    }
    {
        const color = Color.fromString('cyan');
        expect(color.r).toBe(0);
        expect(color.g).toBe(1);
        expect(color.b).toBe(1);
        expect(color.a).toBe(1);
        expect(color.toRgbaString()).toBe('rgb(0, 255, 255)');
    }
    {
        const color = Color.fromString('magenta');
        expect(color.r).toBe(1);
        expect(color.g).toBe(0);
        expect(color.b).toBe(1);
        expect(color.a).toBe(1);
        expect(color.toRgbaString()).toBe('rgb(255, 0, 255)');
    }
    expect(() => { Color.fromRgbaString('#'); }).toThrow();
    expect(() => { Color.fromRgbaString('rgba()'); }).toThrow();
    expect(() => { Color.fromRgbaString('blah'); }).toThrow();
});

test('toHexString', () => {
    {
        const color = new Color(0, 1, 1);
        expect(color.toHexString()).toBe('#00ffff');
    }
    {
        const color = new Color(0, 1, 0);
        expect(color.toHexString()).toBe('#00ff00');
    }
});
