import { expect, test } from '@jest/globals';
import { LinearScale } from './linearScale';

test('domain', () => {
    const scale = new LinearScale();

    expect(scale.domain).toEqual([0, 1]);
    scale.domain = [5, 10];
    expect(scale.domain).toEqual([5, 10]);
});

test('range', () => {
    const scale = new LinearScale();

    expect(scale.range).toEqual([0, 1]);
    scale.range = [5, 10];
    expect(scale.range).toEqual([5, 10]);
});

test('convert linear', () => {
    const scale = new LinearScale();

    scale.domain = [-100, 100];
    scale.range = [0, 100];

    expect(scale.convert(0, { strict: false })).toBe(50);

    expect(scale.convert(-100, { strict: false })).toBe(0);
    expect(scale.convert(100, { strict: false })).toBe(100);

    expect(scale.convert(-100, { strict: true })).toBe(0);
    expect(scale.convert(100, { strict: true })).toBe(100);
});

test('convert linear clamp', () => {
    const scale = new LinearScale();

    scale.domain = [-100, 100];
    scale.range = [0, 100];

    expect(scale.convert(-300, { strict: false })).toBe(0);
    expect(scale.convert(300, { strict: false })).toBe(100);

    expect(scale.convert(-300, { strict: true })).toBeNaN();
    expect(scale.convert(300, { strict: true })).toBeNaN();
});

test('convert linear with zero width domain', () => {
    const scale = new LinearScale();

    scale.domain = [100, 100];
    scale.range = [0, 100];

    expect(scale.convert(100, { strict: false })).toBe(50);
});

test('invert linear', () => {
    const scale = new LinearScale();

    scale.domain = [-100, 100];
    scale.range = [0, 100];

    expect(scale.invert(50)).toBe(0);
    expect(scale.invert(0)).toBe(-100);
    expect(scale.invert(75)).toBe(50);
});

test('invert linear clamp', () => {
    const scale = new LinearScale();

    scale.domain = [-100, 100];
    scale.range = [0, 100];

    expect(scale.invert(-50)).toBe(-100);
    expect(scale.invert(150)).toBe(100);
});

test('invert linear with zero length range', () => {
    const scale = new LinearScale();

    scale.domain = [0, 100];
    scale.range = [100, 100];

    expect(scale.invert(100)).toBe(50);
});
