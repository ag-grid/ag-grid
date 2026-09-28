import { describe, expect, it } from 'vitest';

import { renderChartsThemeCode, toChartTheme } from './chartsThemeOutput';

const selection = {
    baseTheme: 'ag-default' as const,
    params: {},
    palette: {
        fills: ['#5090dc', '#ffa03a'],
        strokes: ['#2b5c95', '#cc6f10'],
        strokesDerived: [true, false],
        up: { fill: '#459d55', stroke: '#1e652e', strokeDerived: true },
    },
};

describe('toChartTheme', () => {
    it('emits the palette without the editor bookkeeping behind it', () => {
        // Whether a stroke follows its fill is a question for the editor, and
        // an answer AG Charts has no key for. The shared palette is otherwise a
        // structural subset of the theme's, so an extra field rides along
        // silently unless it is projected out.
        expect(toChartTheme(selection).palette).toEqual({
            fills: ['#5090dc', '#ffa03a'],
            strokes: ['#2b5c95', '#cc6f10'],
            up: { fill: '#459d55', stroke: '#1e652e' },
        });
    });

    it('leaves the palette out entirely when the user has set none', () => {
        // An empty palette in the snippet would read as "no series colours"
        // rather than "the base theme's".
        expect(toChartTheme({ ...selection, palette: { fills: [], strokes: [] } }).palette).toBeUndefined();
    });

    it('outlines nothing once the palette says so', () => {
        // Including the series that draw an outline whether or not the chart
        // asks for one, which an unset stroke width would not cover.
        const off = { ...selection, palette: { ...selection.palette, strokesEnabled: false } };
        expect(toChartTheme(off).palette).toEqual({
            fills: ['#5090dc', '#ffa03a'],
            strokes: ['#5090dc', '#ffa03a'],
            up: { fill: '#459d55', stroke: '#459d55' },
        });
        expect(renderChartsThemeCode(off)).not.toContain('strokesEnabled');
    });

    it('keeps every bookkeeping key out of the snippet the user copies', () => {
        // The end of the same thread: whatever survives the projection is what
        // someone pastes into their app.
        expect(renderChartsThemeCode(selection)).not.toContain('Derived');
    });
});

describe('renderChartsThemeCode', () => {
    const render = (params: Record<string, unknown>) =>
        renderChartsThemeCode({ ...selection, params, palette: { fills: [], strokes: [] } });

    it('emits the object a user pastes into their app', () => {
        expect(render({ backgroundColor: '#ffffff', chartPadding: '24px' })).toBe(
            [
                '// pass myTheme to the `theme` option of your chart',
                'export const myTheme = {',
                "    baseTheme: 'ag-default',",
                '    params: {',
                "        backgroundColor: '#ffffff',",
                '        chartPadding: 24',
                '    }',
                '};',
                '',
            ].join('\n')
        );
    });

    it('escapes an apostrophe rather than ending the string early', () => {
        // JSON quotes with `"`, the snippet with `'` - a font family carrying
        // one would otherwise close its own literal and the paste would not parse.
        expect(render({ fontFamily: "Bob's Sans" })).toContain("fontFamily: 'Bob\\'s Sans'");
    });

    it('quotes a key that is not an identifier', () => {
        expect(render({ 'ag-thing': '#fff' })).toContain("'ag-thing': '#fff'");
    });
});
