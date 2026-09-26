import { EMPTY_PALETTE } from '@ag-website-shared/components/theme-builder/palette';
import type { ValidationResult } from '@ag-website-shared/components/theme-builder/themeImport';
import { allParamModels } from '@ag-website-shared/theming/ParamModel';
import type { Store } from '@ag-website-shared/theming/store';
import { createStore } from 'jotai';
import { describe, expect, it } from 'vitest';

import { DEFAULT_THEME_NAME, getPalette } from './chartsTheme';
import { validateChartsThemeCode } from './chartsThemeImport';
import { type ChartsThemeSelection, renderChartsThemeCode, toChartTheme } from './chartsThemeOutput';
import { getStoredPalette, setStoredPalette } from './paletteModel';
import { getImportedBaseTheme, getSelectedPresetId, setImportedBaseTheme, setSelectedPresetId } from './presetModel';
// Side-effect import, as in the builder itself: it points the shared param model
// at AG Charts' params, which everything below reads through.
import './registerThemeBuilderConfig';

/**
 * Export and import are one feature, so most of what follows is a round trip
 * rather than an assertion about the parsed shape. A plain `createStore()`,
 * since `initialiseStore()` reads `localStorage` to check its format version.
 */

const paramModel = (property: string) => {
    const model = allParamModels().find((param) => param.property === property);
    if (!model) {
        throw new Error(`No such charts param: ${property}`);
    }
    return model;
};

const paramValues = (store: Store): Record<string, unknown> => {
    const entries = allParamModels().map((param) => [param.property, store.get(param.valueAtom)] as const);
    return Object.fromEntries(entries.filter(([, value]) => value != null));
};

/** What the builder would render and export, read back out of the store. */
const selectionFromStore = (store: Store): ChartsThemeSelection => ({
    baseTheme: getImportedBaseTheme(store) ?? DEFAULT_THEME_NAME,
    params: paramValues(store),
    palette: getStoredPalette(store) ?? EMPTY_PALETTE,
});

const importInto = (store: Store, code: string): ValidationResult => {
    const result = validateChartsThemeCode(code);
    if (!('apply' in result)) {
        throw new Error(`Expected to be able to apply this code, got: ${JSON.stringify(result)}`);
    }
    result.apply(store);
    return result;
};

const summaryOf = (result: ValidationResult) => ('summary' in result ? result.summary : undefined);
const warningsOf = (result: ValidationResult) => ('warnings' in result ? result.warnings : []);

const CUSTOMISED: ChartsThemeSelection = {
    baseTheme: 'ag-default-dark',
    params: {
        fontFamily: { googleFont: 'Inter' },
        fontSize: 13,
        fontWeight: 500,
        backgroundColor: '#0B1220',
        foregroundColor: '#E2E8F0',
        accentColor: '#38BDF8',
        borderRadius: 8,
        chartPadding: 24,
        // A composite and a reference: the two param values that are objects
        // rather than scalars, and so the two the token scanner has to read as
        // a whole.
        menuBorder: { color: '#1E293B', width: 2 },
        gridLineColor: { ref: 'axisLineColor' },
    },
    palette: getPalette('ag-vivid-dark'),
};

describe('importing an AG Charts theme', () => {
    it('round-trips a customised theme through the exported snippet', () => {
        const store = createStore();
        importInto(store, renderChartsThemeCode(CUSTOMISED));
        expect(toChartTheme(selectionFromStore(store))).toEqual(toChartTheme(CUSTOMISED));
    });

    it('names what it found, params not being the whole of a theme', () => {
        const result = validateChartsThemeCode(renderChartsThemeCode(CUSTOMISED));
        expect(result.status).toBe('success');
        expect(summaryOf(result)).toBe('Found 10 theme parameters, a palette and the ag-default-dark base theme');
    });

    it('brings back strokes that were switched off', () => {
        // Their colours do not survive - an AG Charts palette says "no stroke"
        // by matching each stroke to its fill, and that is what was exported -
        // but the toggle does, which is what the user set.
        const strokesOff: ChartsThemeSelection = {
            baseTheme: 'ag-vivid',
            params: {},
            palette: { ...getPalette('ag-vivid'), strokesEnabled: false },
        };
        const store = createStore();
        importInto(store, renderChartsThemeCode(strokesOff));

        expect(getStoredPalette(store)?.strokesEnabled).toBe(false);
        expect(toChartTheme(selectionFromStore(store))).toEqual(toChartTheme(strokesOff));
    });

    it('replaces the theme rather than merging into it', () => {
        const store = createStore();
        const accentColor = paramModel('accentColor');
        store.set(accentColor.valueAtom, '#FF0000');

        importInto(store, "export const myTheme = { params: { backgroundColor: '#FFFFFF' } };");

        expect(store.get(accentColor.valueAtom)).toBeUndefined();
        expect(store.get(paramModel('backgroundColor').valueAtom)).toBe('#FFFFFF');
    });

    it('replaces the palette, base theme and preset that were standing', () => {
        // Leaving the preset selected would also re-seed its palette on the next reload.
        const store = createStore();
        setSelectedPresetId(store, 'midnight');
        setStoredPalette(store, getPalette('ag-vivid'));
        setImportedBaseTheme(store, 'ag-vivid');

        importInto(store, "export const myTheme = { params: { backgroundColor: '#FFFFFF' } };");

        expect(getStoredPalette(store)).toBeUndefined();
        expect(getImportedBaseTheme(store)).toBeUndefined();
        // Null, not unset: unset is a first visit, which seeds a preset back in.
        expect(getSelectedPresetId(store)).toBeNull();
    });

    it('leaves an accent the imported palette omits unset', () => {
        // Omitting one says "keep the base theme's candles"; filling it in makes every import full.
        const store = createStore();
        importInto(store, "export const myTheme = { palette: { fills: ['#FF0000'], strokes: ['#880000'] } };");

        const stored = getStoredPalette(store);
        expect(stored?.up).toBeUndefined();
        expect(stored?.down).toBeUndefined();
        expect(stored?.neutral).toBeUndefined();
    });

    it('reads a theme that is nothing but a palette', () => {
        const result = validateChartsThemeCode(
            "export const myTheme = { palette: { fills: ['#FF0000'], strokes: ['#880000'] } };"
        );
        expect(result).toMatchObject({ status: 'success', validParamCount: 0 });
        expect(summaryOf(result)).toBe('Found a palette');
    });

    it('reads a theme that is nothing but a base theme', () => {
        const store = createStore();
        const result = importInto(store, "export const myTheme = { baseTheme: 'ag-financial-dark' };");

        expect(summaryOf(result)).toBe('Found the ag-financial-dark base theme');
        expect(getImportedBaseTheme(store)).toBe('ag-financial-dark');
    });

    it('keeps a palette colour paired with its own stroke when one is dropped', () => {
        // `fills` also admits gradients and patterns, which the palette editor
        // has no way to show. Dropping one has to take its stroke with it, or
        // every later stroke lands on the wrong fill.
        const store = createStore();
        const result = importInto(
            store,
            `export const myTheme = {
                 palette: {
                     fills: [{ type: 'linear-gradient' }, '#FF0000'],
                     strokes: ['#111111', '#220000'],
                 },
             };`
        );

        expect(warningsOf(result)).toEqual(['Ignored 1 palette colour that is not a plain colour']);
        expect(getStoredPalette(store)).toMatchObject({ fills: ['#FF0000'], strokes: ['#220000'] });
    });

    it('derives a stroke for a palette that carries fills alone', () => {
        const store = createStore();
        importInto(store, "export const myTheme = { palette: { fills: ['#FF0000'] } };");

        const stored = getStoredPalette(store);
        expect(stored?.fills).toEqual(['#FF0000']);
        expect(stored?.strokes).toHaveLength(1);
        // Derived, not the fill: a palette carrying no strokes is one AG Charts
        // outlines for itself, which is not the same as strokes being off.
        expect(stored?.strokes[0]).not.toBe('#FF0000');
        expect(stored?.strokesEnabled).toBeUndefined();
    });

    it('warns about a base theme it does not know, and applies the rest', () => {
        const store = createStore();
        const result = importInto(
            store,
            "export const myTheme = { baseTheme: 'ag-chartreuse', params: { accentColor: '#38BDF8' } };"
        );

        expect(warningsOf(result)).toEqual(['Ignored unknown base theme: "ag-chartreuse"']);
        expect(summaryOf(result)).toBe('Found 1 theme parameter');
        expect(getImportedBaseTheme(store)).toBeUndefined();
        expect(store.get(paramModel('accentColor').valueAtom)).toBe('#38BDF8');
    });

    it('warns about a param value the theming engine would reject', () => {
        const result = validateChartsThemeCode(
            "export const myTheme = { params: { accentColor: 42, backgroundColor: '#FFFFFF' } };"
        );

        expect(result.status).toBe('warning');
        expect(warningsOf(result)).toEqual(['Invalid value for accentColor: 42']);
        expect(summaryOf(result)).toBe('Found 1 theme parameter');
    });

    it('describes the shape it wants when the code holds no theme at all', () => {
        expect(validateChartsThemeCode('const notATheme = { spacing: 8 };')).toEqual({
            status: 'error',
            validParamCount: 0,
            error: expect.stringContaining('Could not find an AG Charts theme'),
        });
    });

    it('reads code a user wrote by hand, trailing commas and all', () => {
        const store = createStore();
        importInto(
            store,
            `export const myTheme = {
                 baseTheme: 'ag-default',
                 params: {
                     accentColor: '#38BDF8',
                     menuBorder: { color: '#1E293B', width: 2, },
                 },
             };`
        );

        expect(store.get(paramModel('accentColor').valueAtom)).toBe('#38BDF8');
        expect(store.get(paramModel('menuBorder').valueAtom)).toEqual({ color: '#1E293B', width: 2 });
    });

    it('says nothing about an empty box', () => {
        expect(validateChartsThemeCode('   ')).toEqual({ status: 'empty', validParamCount: 0 });
    });
});
