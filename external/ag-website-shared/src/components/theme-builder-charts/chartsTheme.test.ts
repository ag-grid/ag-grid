import { type AgChartThemeName, _Theme } from 'ag-charts-community';
import { describe, expect, it } from 'vitest';

import { paramValueToCss } from '../../theming/api';
import {
    CHARTS_PARAM_DEFAULTS,
    PUBLIC_PARAM_NAMES,
    getPalette,
    getStackParams,
    toStackParamValue,
} from './chartsTheme';

// The registry's type makes every entry optional and admits sentinel keys
// ('undefined', 'null') that the literal itself never populates.
const STOCK_THEMES = Object.entries(_Theme.themes) as [AgChartThemeName, () => _Theme.ChartTheme][];

/**
 * The shadow theme only works while the two representations agree. These tests
 * guard the seam: that every AG Charts default survives translation, and that
 * the colour arithmetic means the same thing on both sides.
 */
describe('AG Charts param translation', () => {
    it('translates every public param default to a value the theming engine accepts', () => {
        const rejected = PUBLIC_PARAM_NAMES.filter(
            (property) => paramValueToCss(property, CHARTS_PARAM_DEFAULTS[property], null) === false
        );
        expect(rejected).toEqual([]);
    });

    it('drops no param on the way through', () => {
        const dropped = PUBLIC_PARAM_NAMES.filter((property) => CHARTS_PARAM_DEFAULTS[property] === undefined);
        expect(dropped).toEqual([]);
    });

    it('handles every operation AG Charts uses in its param defaults', () => {
        // Fails loudly if a new `$operation` appears, rather than translating it
        // to something plausible but wrong.
        const operations = new Set<string>();
        for (const [, createTheme] of STOCK_THEMES) {
            const params = createTheme().params as Record<string, unknown>;
            for (const property of PUBLIC_PARAM_NAMES) {
                collectOperations(params[property], operations);
            }
        }
        expect([...operations].sort()).toEqual(['$foregroundBackgroundMix', '$mix', '$ref']);
    });

    describe('colour references', () => {
        it('maps $ref to a plain reference', () => {
            expect(toStackParamValue('axisLineColor', { $ref: 'borderColor' })).toEqual({ ref: 'borderColor' });
        });

        it('maps $foregroundBackgroundMix to the foreground weight over the background', () => {
            // AG Charts computes mix(foreground, background, 1 - ratio), so the
            // ratio is the weight of the foreground - ag-stack's `mix` exactly.
            expect(toStackParamValue('borderColor', { $foregroundBackgroundMix: 0.15 })).toEqual({
                ref: 'foregroundColor',
                mix: 0.15,
                onto: 'backgroundColor',
            });
        });

        it('inverts $mix, whose ratio runs the other way', () => {
            // mix(a, b, t) lerps a -> b, so `a` carries a weight of 1 - t.
            expect(
                toStackParamValue('subtleTextColor', {
                    $mix: [{ $ref: 'textColor' }, { $ref: 'chartBackgroundColor' }, 0.38],
                })
            ).toEqual({ ref: 'textColor', mix: 0.62, onto: 'chartBackgroundColor' });
        });

        it('retargets AG Charts CSS variables so the editors can resolve them', () => {
            expect(toStackParamValue('focusShadow', '0 0 0 3px var(--ag-charts-accent-color)')).toBe(
                '0 0 0 3px var(--ag-accent-color)'
            );
        });

        it('translates the members of a composite param', () => {
            expect(toStackParamValue('buttonBorder', { color: { $ref: 'borderColor' }, width: 1 })).toEqual({
                color: { ref: 'borderColor' },
                width: 1,
            });
        });
    });

    describe('stock themes', () => {
        it('reads params and a palette for every stock theme', () => {
            for (const [themeName, createTheme] of STOCK_THEMES) {
                const params = getStackParams(themeName);
                expect(Object.keys(params)).toHaveLength(PUBLIC_PARAM_NAMES.length);

                const palette = getPalette(themeName);
                expect(palette.fills.length).toBeGreaterThan(0);
                // Fills and strokes are index-paired, which the palette editor
                // relies on to keep a series' two colours together.
                expect(palette.strokes).toHaveLength(palette.fills.length);
                // No stock theme uses a gradient or pattern fill, so nothing is
                // dropped by the narrowing in `getPalette`.
                expect(palette.fills).toHaveLength(createTheme().palette.fills.length);
            }
        });
    });
});

const collectOperations = (value: unknown, into: Set<string>) => {
    if (typeof value !== 'object' || value == null) return;
    if (Array.isArray(value)) {
        value.forEach((member) => collectOperations(member, into));
        return;
    }
    for (const [key, member] of Object.entries(value)) {
        if (key.startsWith('$')) into.add(key);
        collectOperations(member, into);
    }
};
