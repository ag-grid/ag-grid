import { expect, test } from '@jest/globals';
import { Color } from '../util/color';
import color from './color';

test('string colors', () => {
    {
        const a = '#000';
        const b = '#fff';
        const i = color(a, b);
        expect(i(0.5)).toBe('rgb(128, 128, 128)');
        expect(i(0)).toBe('rgb(0, 0, 0)');
        expect(i(1)).toBe('rgb(255, 255, 255)');
    }
    {
        const a = '#00000000';
        const b = '#ffffffff';
        const i = color(a, b);
        expect(i(0.5)).toBe('rgba(128, 128, 128, 0.5)');
        expect(i(0)).toBe('rgba(0, 0, 0, 0)');
        expect(i(1)).toBe('rgb(255, 255, 255)');
    }
});

test('Color instances', () => {
    {
        const a = Color.fromArray([0, 0, 0]);
        const b = Color.fromArray([1, 1, 1]);
        const i = color(a, b);
        expect(i(0.5)).toBe('rgb(128, 128, 128)');
        expect(i(0)).toBe('rgb(0, 0, 0)');
        expect(i(1)).toBe('rgb(255, 255, 255)');
    }
    {
        const a = Color.fromArray([0, 0, 0, 0]);
        const b = Color.fromArray([1, 1, 1, 1]);
        const i = color(a, b);
        expect(i(0.5)).toBe('rgba(128, 128, 128, 0.5)');
        expect(i(0)).toBe('rgba(0, 0, 0, 0)');
        expect(i(1)).toBe('rgb(255, 255, 255)');
    }
});

test('Mixed case', () => {
    {
        const a = Color.fromArray([0, 0, 0]);
        const b = '#fff';
        const i = color(a, b);
        expect(i(0.5)).toBe('rgb(128, 128, 128)');
        expect(i(0)).toBe('rgb(0, 0, 0)');
        expect(i(1)).toBe('rgb(255, 255, 255)');
    }
    {
        const a = '#00000000';
        const b = Color.fromArray([1, 1, 1, 1]);
        const i = color(a, b);
        expect(i(0.5)).toBe('rgba(128, 128, 128, 0.5)');
        expect(i(0)).toBe('rgba(0, 0, 0, 0)');
        expect(i(1)).toBe('rgb(255, 255, 255)');
    }
});

test('Invalid start', () => {
    {
        const a = '!!!';
        const b = '#fff';
        const i = color(a, b);
        expect(i(0.5)).toBe('rgb(128, 128, 128)');
        expect(i(0)).toBe('rgb(0, 0, 0)');
        expect(i(1)).toBe('rgb(255, 255, 255)');
    }
});

test('Invalid end', () => {
    {
        const a = '#00000000';
        const b = '!!!';
        const i = color(a, b);
        expect(i(0.5)).toBe('rgba(0, 0, 0, 0.5)');
        expect(i(0)).toBe('rgba(0, 0, 0, 0)');
        expect(i(1)).toBe('rgb(0, 0, 0)');
    }
});
