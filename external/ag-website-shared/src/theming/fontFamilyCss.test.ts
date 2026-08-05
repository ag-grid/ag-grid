import { describe, expect, it } from 'vitest';

import { normaliseFontFamilyList, parseFontFamilyList } from './fontFamilyCss';

const same = (a: string, b: string) => normaliseFontFamilyList(a) === normaliseFontFamilyList(b);

describe('normaliseFontFamilyList', () => {
    it('ignores quoting that does not change which font is selected', () => {
        expect(same('"DM Sans", sans-serif', 'DM Sans, sans-serif')).toBe(true);
        expect(same("'IBM Plex Mono', monospace", 'IBM Plex Mono, monospace')).toBe(true);
        expect(same('Inter, sans-serif', 'Inter, sans-serif')).toBe(true);
    });

    it('collapses insignificant whitespace in unquoted names only', () => {
        expect(same('DM   Sans,  sans-serif', 'DM Sans, sans-serif')).toBe(true);
        expect(same('"DM  Sans"', '"DM Sans"')).toBe(false);
    });

    it('keeps a quoted name distinct from the generic family of the same spelling', () => {
        expect(same('"serif"', 'serif')).toBe(false);
        expect(same('"monospace"', 'monospace')).toBe(false);
        expect(same('"inherit"', 'inherit')).toBe(false);
    });

    it('keeps a quoted name containing a comma as a single family', () => {
        expect(parseFontFamilyList('"Foo, Bar"')).toEqual([{ name: 'Foo, Bar', quoted: true }]);
        expect(same('"Foo, Bar"', 'Foo, Bar')).toBe(false);
    });

    it('preserves apostrophes and escapes inside quoted names', () => {
        expect(parseFontFamilyList('"Bob\'s Font"')).toEqual([{ name: "Bob's Font", quoted: true }]);
        expect(parseFontFamilyList('"Say \\"Hi\\""')).toEqual([{ name: 'Say "Hi"', quoted: true }]);
        expect(same('"Bob\'s Font"', 'Bobs Font')).toBe(false);
    });

    it('does not split on a comma inside a function', () => {
        expect(parseFontFamilyList('var(--a, sans-serif), serif')).toEqual([
            { name: 'var(--a, sans-serif)', quoted: false },
            { name: 'serif', quoted: false },
        ]);
    });

    it('distinguishes different font lists', () => {
        expect(same('Inter, sans-serif', 'Inter')).toBe(false);
        expect(same('Inter, sans-serif', 'Arial, sans-serif')).toBe(false);
        expect(same('Inter, sans-serif', 'sans-serif, Inter')).toBe(false);
    });
});
