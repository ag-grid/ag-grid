import { describe, expect, it } from 'vitest';

import { followRefs, resolveColorValue } from './renderColorValue';

describe('followRefs', () => {
    it('follows references to the value they end at', () => {
        expect(followRefs({ ref: 'a' }, { a: { ref: 'b' }, b: 3 })).toBe(3);
    });

    it('leaves a mix alone', () => {
        const mix = { ref: 'a', mix: 0.5 };
        expect(followRefs(mix, { a: 'red' })).toBe(mix);
    });

    it('throws on a circular reference', () => {
        expect(() => followRefs({ ref: 'a' }, { a: { ref: 'b' }, b: { ref: 'a' } })).toThrow(/Circular/);
    });
});

describe('resolveColorValue', () => {
    const params = { borderColor: { ref: 'foregroundColor' }, foregroundColor: '#000', backgroundColor: '#fff' };

    it('leaves a plain colour alone', () => {
        expect(resolveColorValue('red', params)).toBe('red');
    });

    it('follows references to the colour they end at', () => {
        expect(resolveColorValue({ ref: 'borderColor' }, params)).toBe('#000');
    });

    it('writes a mix out as CSS', () => {
        expect(resolveColorValue({ ref: 'borderColor', mix: 0.25, onto: 'backgroundColor' }, params)).toBe(
            'color-mix(in srgb, #fff, #000 25%)'
        );
    });
});
