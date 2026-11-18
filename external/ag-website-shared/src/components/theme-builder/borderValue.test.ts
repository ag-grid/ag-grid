import { describe, expect, it } from 'vitest';

import { borderIsOn, borderParts, withBorderPart } from './borderValue';

describe('borderIsOn', () => {
    it.each([
        [true, true],
        [{ color: 'red' }, true],
        ['1px solid red', true],
        [false, false],
        [undefined, false],
        ['none', false],
        [{ color: 'transparent' }, false],
        ['1px solid transparent', false],
        [{ color: { ref: 'foregroundColor', mix: 0.2 } }, true],
    ])('%j is on: %s', (value, expected) => {
        expect(borderIsOn('rowBorder', value)).toBe(expected);
    });

    it('treats an off column border as off, though it renders as a transparent line', () => {
        expect(borderIsOn('columnBorder', false)).toBe(false);
    });

    it.each([
        [true, true],
        [false, false],
    ])('follows a reference to a border that is %j', (rowBorder, expected) => {
        expect(borderIsOn('headerRowBorder', { ref: 'rowBorder' }, { rowBorder })).toBe(expected);
    });
});

describe('borderParts', () => {
    it('returns the parts an object value sets', () => {
        expect(borderParts({ style: 'dashed', width: 2, color: 'red' })).toEqual({
            style: 'dashed',
            width: 2,
            color: 'red',
        });
    });

    it.each([true, false, undefined])('%j sets no parts', (value) => {
        expect(borderParts(value)).toEqual({});
    });

    it.each([
        ['2px dashed red', { width: '2px', style: 'dashed', color: 'red' }],
        ['solid rgb(1, 2, 3)', { style: 'solid', color: 'rgb(1, 2, 3)' }],
        ['thin', { width: 'thin' }],
    ])('reads the parts of %j', (value, expected) => {
        expect(borderParts(value)).toEqual(expected);
    });

    it.each(['1px solid var(--ag-border-color)', '1px 2px solid'])('sets no parts from %j', (value) => {
        expect(borderParts(value)).toEqual({});
    });

    it('follows a reference to the border it names', () => {
        const params = { headerRowBorder: { ref: 'rowBorder' }, rowBorder: { width: 2, style: 'dotted' } };
        expect(borderParts({ ref: 'headerRowBorder' }, params)).toEqual({ width: 2, style: 'dotted' });
    });
});

describe('withBorderPart', () => {
    it('sets a part on a border that is simply on', () => {
        expect(withBorderPart(true, 'color', 'red')).toEqual({ color: 'red' });
    });

    it('keeps the other parts', () => {
        expect(withBorderPart({ color: 'red', style: 'dotted' }, 'width', 3)).toEqual({
            color: 'red',
            style: 'dotted',
            width: 3,
        });
    });

    it('keeps the other parts of a border written as CSS', () => {
        expect(withBorderPart('2px dashed red', 'color', 'blue')).toEqual({
            width: '2px',
            style: 'dashed',
            color: 'blue',
        });
    });

    it('keeps the parts of a referenced border', () => {
        expect(withBorderPart({ ref: 'rowBorder' }, 'color', 'blue', { rowBorder: { width: 2 } })).toEqual({
            width: 2,
            color: 'blue',
        });
    });

    it('clears a part so its default applies', () => {
        expect(withBorderPart({ color: 'red', width: 3 }, 'color', null)).toEqual({ width: 3 });
    });

    it('falls back to a plain on border once every part is cleared', () => {
        expect(withBorderPart({ color: 'red' }, 'color', null)).toBe(true);
    });
});
