import { expect, test } from '@jest/globals';
import { ColorScale } from './colorScale';

test('domain', () => {
    const scale = new ColorScale();

    expect(scale.domain).toEqual([0, 1]);
    scale.domain = [5, 10];
    expect(scale.domain).toEqual([5, 10]);
});

test('range', () => {
    const scale = new ColorScale();

    expect(scale.range).toEqual(['red', 'green']);
    scale.range = ['black', '#ffffff'];
    expect(scale.range).toEqual(['black', '#ffffff']);
});

test('convert', () => {
    const scale = new ColorScale();

    scale.domain = [-100, 100];
    scale.range = ['black', '#ffffff'];

    expect(scale.convert(-101)).toBe('black');
    expect(scale.convert(-100)).toBe('black');
    expect(scale.convert(0)).toBe('rgb(128, 128, 128)');
    expect(scale.convert(100)).toBe('#ffffff');
    expect(scale.convert(101)).toBe('#ffffff');
});

test('multi-color range', () => {
    const scale = new ColorScale();

    scale.domain = [-100, 100];
    scale.range = ['black', 'red', '#ffffff'];

    expect(scale.convert(-101)).toBe('black');
    expect(scale.convert(-100)).toBe('black');
    expect(scale.convert(-50)).toBe('rgb(128, 0, 0)');
    expect(scale.convert(0)).toBe('rgb(255, 0, 0)');
    expect(scale.convert(50)).toBe('rgb(255, 128, 128)');
    expect(scale.convert(100)).toBe('#ffffff');
    expect(scale.convert(101)).toBe('#ffffff');
});

test('multi-value domain', () => {
    const scale = new ColorScale();

    scale.domain = [0, 100, 500];
    scale.range = ['black', 'red', '#ffffff'];

    expect(scale.convert(-1)).toBe('black');
    expect(scale.convert(0)).toBe('black');
    expect(scale.convert(50)).toBe('rgb(128, 0, 0)');
    expect(scale.convert(100)).toBe('rgb(255, 0, 0)');
    expect(scale.convert(300)).toBe('rgb(255, 128, 128)');
    expect(scale.convert(500)).toBe('#ffffff');
    expect(scale.convert(501)).toBe('#ffffff');
});
