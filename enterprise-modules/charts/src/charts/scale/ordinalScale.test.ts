import { OrdinalScale } from "./ordinalScale";

test('initial state', () => {
    const scale = new OrdinalScale<number, string>();

    expect(scale.domain).toEqual([]);
    expect(scale.range).toEqual([]);
    expect(scale.convert(0)).toBe(undefined);
});

test('implicit domain creation and explicit unknown', () => {
    const scale = new OrdinalScale<number, string>();

    expect(scale.convert(3)).toBe(undefined);
    expect(scale.convert(2)).toBe(undefined);
    expect(scale.domain).toEqual([3, 2]);
    expect(scale.convert(1)).toBe(undefined);
    expect(scale.domain).toEqual([3, 2, 1]);
    expect(scale.range).toEqual([]);

    expect(scale.unknown).toBe(undefined);
    const unknown = 'derp';
    scale.unknown = unknown;
    expect(scale.convert(4)).toBe(unknown);
    expect(scale.convert(5)).toBe(unknown);
    expect(scale.domain).toEqual([3, 2, 1]);
    expect(scale.range).toEqual([]);
});

test('convert', () => {
    const scale = new OrdinalScale<number, string>();

    scale.domain = [1, 2, 3, 4, 5];
    scale.range = ['red', 'green', 'blue'];

    expect(scale.convert(1)).toBe('red');
    expect(scale.convert(2)).toBe('green');
    expect(scale.convert(3)).toBe('blue');
    expect(scale.convert(4)).toBe('red');
    expect(scale.convert(5)).toBe('green');
});
