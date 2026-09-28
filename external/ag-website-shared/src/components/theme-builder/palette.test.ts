import { describe, expect, it } from 'vitest';

import {
    EMPTY_PALETTE,
    type Palette,
    deriveStroke,
    fromSeriesColors,
    paletteIsEmpty,
    strokesAreEnabled,
    toSeriesColors,
    toThemePalette,
    withAccentColors,
    withAccentFill,
    withAccentStroke,
    withDerivedAccentStroke,
    withDerivedStroke,
    withFill,
    withPaletteDefaults,
    withStroke,
    withStrokesEnabled,
} from './palette';

const palette: Palette = {
    fills: ['#aaa', '#bbb'],
    strokes: ['#111', '#222'],
    strokesDerived: [false, false],
    up: { fill: '#0f0', stroke: '#0a0', strokeDerived: false },
};

describe('toSeriesColors', () => {
    it('pairs each fill with the stroke at the same index', () => {
        expect(toSeriesColors(palette)).toEqual([
            { fill: '#aaa', stroke: '#111', strokeDerived: false },
            { fill: '#bbb', stroke: '#222', strokeDerived: false },
        ]);
    });

    it('derives a stroke where one is missing', () => {
        // A host with independent fill and stroke slots can leave the arrays
        // ragged; the editor still has to render a stroke picker for every row.
        const colors = toSeriesColors({ fills: ['#aaa', '#bbb'], strokes: ['#111'] });
        expect(colors[0]).toEqual({ fill: '#aaa', stroke: '#111', strokeDerived: true });
        expect(colors[1]).toEqual({ fill: '#bbb', stroke: deriveStroke('#bbb'), strokeDerived: true });
    });

    it('treats a palette that predates the flag as following its fills', () => {
        // The behaviour that needs no maintenance is the safer default for a
        // stored palette we know nothing about.
        expect(toSeriesColors({ fills: ['#aaa'], strokes: ['#111'] })[0].strokeDerived).toBe(true);
    });
});

describe('fromSeriesColors', () => {
    it('splits slots back into index-paired arrays', () => {
        const next = fromSeriesColors(palette, [{ fill: '#ccc', stroke: '#333', strokeDerived: false }]);
        expect(next.fills).toEqual(['#ccc']);
        expect(next.strokes).toEqual(['#333']);
        expect(next.strokesDerived).toEqual([false]);
    });

    it('leaves the accents untouched', () => {
        expect(fromSeriesColors(palette, []).up).toEqual(palette.up);
    });

    it('round-trips a palette unchanged', () => {
        expect(fromSeriesColors(palette, toSeriesColors(palette))).toEqual(palette);
    });
});

describe('deriveStroke', () => {
    it('darkens a fill without moving its hue', () => {
        expect(deriveStroke('#5090dc')).toBe('#1E5596');
        expect(deriveStroke('#ffa03a')).toBe('#BC6100');
    });

    it('lands near the hand-tuned strokes AG Charts ships', () => {
        // The rule is only worth having if it agrees with the palettes the
        // product already ships - `ag-default`'s blue fill is paired with
        // #2b5c95, and a rule that produced something unrecognisable next to
        // that would be a different palette rather than a derived one.
        const [r, g, b] = channels(deriveStroke('#5090dc'));
        const [tr, tg, tb] = channels('#2b5c95');
        expect(Math.abs(r - tr) + Math.abs(g - tg) + Math.abs(b - tb)).toBeLessThan(30);
    });

    it('keeps transparency, and normalises whatever notation it was given', () => {
        expect(deriveStroke('#5090dc80')).toBe('#1E559680');
        expect(deriveStroke('rgb(80,144,220)')).toBe('#1E5596');
    });

    it('returns a colour it cannot read unchanged', () => {
        // A `var()` or a gradient has reached a code path built for neither.
        // A stroke the same colour as its fill is one nobody notices, which
        // beats a guess at what the reference resolves to.
        expect(deriveStroke('var(--brand)')).toBe('var(--brand)');
    });

    it('has nowhere to go from black, and says so by staying there', () => {
        expect(deriveStroke('#000000')).toBe('#000000');
    });
});

describe('a stroke that follows its fill', () => {
    const derived = { fill: '#5090dc', stroke: '#2b5c95', strokeDerived: true };
    const chosen = { fill: '#5090dc', stroke: '#2b5c95', strokeDerived: false };

    it('is replaced when the fill changes', () => {
        expect(withFill(derived, '#459d55').stroke).toBe(deriveStroke('#459d55'));
    });

    it('is left alone when the user chose it', () => {
        // The whole point of the flag: a stroke someone picked outlives the
        // fill it was picked against.
        expect(withFill(chosen, '#459d55').stroke).toBe('#2b5c95');
    });

    it('stops following once the user edits it', () => {
        expect(withStroke(derived, '#123456')).toEqual({
            fill: '#5090dc',
            stroke: '#123456',
            strokeDerived: false,
        });
    });

    it('recomputes the moment it is linked back, rather than waiting', () => {
        // A control that changes nothing visible reads as broken.
        expect(withDerivedStroke(chosen, true)).toEqual({
            fill: '#5090dc',
            stroke: deriveStroke('#5090dc'),
            strokeDerived: true,
        });
    });

    it('keeps its colour when unlinked', () => {
        expect(withDerivedStroke(derived, false)).toEqual({ ...derived, strokeDerived: false });
    });
});

describe('an accent stroke that follows its fill', () => {
    it('follows, stops following, and links back like a series slot', () => {
        expect(withAccentFill({ fill: '#0f0', stroke: '#0a0' }, '#5090dc').stroke).toBe(deriveStroke('#5090dc'));
        expect(withAccentFill({ fill: '#0f0', stroke: '#0a0', strokeDerived: false }, '#5090dc').stroke).toBe('#0a0');
        expect(withAccentStroke({ fill: '#0f0' }, '#123456').strokeDerived).toBe(false);
        expect(withDerivedAccentStroke({ fill: '#5090dc', strokeDerived: false }, true).stroke).toBe(
            deriveStroke('#5090dc')
        );
    });

    it('leaves the stroke unset when there is no fill to derive it from', () => {
        // An accent is optional in a way a series slot is not - a palette that
        // sets neither colour must not acquire one by being edited.
        expect(withAccentFill(undefined, undefined).stroke).toBeUndefined();
        expect(withDerivedAccentStroke(undefined, true).stroke).toBeUndefined();
    });
});

describe('withAccentColors', () => {
    it('replaces one accent and keeps the rest', () => {
        const next = withAccentColors(palette, 'down', { fill: '#f00' });
        expect(next.down).toEqual({ fill: '#f00' });
        expect(next.up).toEqual(palette.up);
        expect(next.fills).toEqual(palette.fills);
    });
});

describe('toThemePalette', () => {
    it('drops the editor bookkeeping a chart has no use for', () => {
        // `strokesDerived` says where the next stroke comes from, which is a
        // question for the editor. Passed along it would ride into the theme a
        // user copies out of the tool.
        expect(toThemePalette(palette)).toEqual({
            fills: ['#aaa', '#bbb'],
            strokes: ['#111', '#222'],
            up: { fill: '#0f0', stroke: '#0a0' },
        });
    });

    it('leaves out an accent that was never set', () => {
        expect(toThemePalette({ fills: [], strokes: [] })).toEqual({ fills: [], strokes: [] });
    });

    it('leaves out an accent whose colours were cleared', () => {
        // An empty `up` still reads as a full palette, which draws rising
        // candles solid where the indexed palette the user has draws them hollow.
        const cleared = withAccentColors(palette, 'up', { fill: undefined, stroke: undefined });

        expect(toThemePalette(cleared)).toEqual({ fills: ['#aaa', '#bbb'], strokes: ['#111', '#222'] });
    });

    it('matches every stroke to its fill once strokes are off', () => {
        // The only way to say "no outline" in a palette: dropping `strokes`
        // would inherit the base theme's, which is an outline the user has
        // switched off in a colour they never chose.
        expect(toThemePalette(withStrokesEnabled(palette, false))).toEqual({
            fills: ['#aaa', '#bbb'],
            strokes: ['#aaa', '#bbb'],
            up: { fill: '#0f0', stroke: '#0f0' },
        });
    });
});

describe('strokes switched off', () => {
    it('is on for a palette that has never said', () => {
        expect(strokesAreEnabled(palette)).toBe(true);
        expect(strokesAreEnabled(withStrokesEnabled(palette, false))).toBe(false);
    });

    it('keeps the strokes it was given, to hand back when switched on again', () => {
        // Clearing them would make the checkbox destructive, and there is no
        // undo in the panel.
        const off = withStrokesEnabled(palette, false);
        expect(off.strokes).toEqual(palette.strokes);
        expect(toThemePalette(withStrokesEnabled(off, true))).toEqual(toThemePalette(palette));
    });
});

describe('paletteIsEmpty', () => {
    it('is true only when nothing is set', () => {
        expect(paletteIsEmpty(EMPTY_PALETTE)).toBe(true);
        expect(paletteIsEmpty(palette)).toBe(false);
        expect(paletteIsEmpty({ ...EMPTY_PALETTE, neutral: { fill: '#888' } })).toBe(false);
    });
});

const channels = (hex: string): [number, number, number] => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
];

describe('completing a stored palette', () => {
    const defaults: Palette = {
        fills: ['#aaa'],
        strokes: ['#bbb'],
        up: { fill: '#0f0', stroke: '#0a0' },
        down: { fill: '#f00', stroke: '#a00' },
        neutral: { fill: '#888', stroke: '#555' },
    };

    it('supplies the financial colours a record was written without', () => {
        // A palette with none of the three is an indexed palette to AG Charts,
        // which then draws rising candles hollow - so the outline is the whole
        // candle, and switching it off empties the chart.
        const stored: Palette = { fills: ['#111', '#222'], strokes: ['#333', '#444'] };
        expect(withPaletteDefaults(stored, defaults)).toEqual({
            fills: ['#111', '#222'],
            strokes: ['#333', '#444'],
            up: { fill: '#0f0', stroke: '#0a0' },
            down: { fill: '#f00', stroke: '#a00' },
            neutral: { fill: '#888', stroke: '#555' },
        });
    });

    it('leaves a colour the user has cleared cleared', () => {
        // Cleared is an answer, and an accent that has been edited is present
        // whether or not there is a colour in it.
        const stored: Palette = { fills: ['#111'], strokes: ['#333'], up: { fill: undefined, stroke: undefined } };
        expect(withPaletteDefaults(stored, defaults).up).toEqual({ fill: undefined, stroke: undefined });
    });
});
