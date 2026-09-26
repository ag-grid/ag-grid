import {
    type Palette,
    type PaletteAccent,
    deriveStroke,
    paletteIsEmpty,
} from '@ag-website-shared/components/theme-builder/palette';
import type { ValidationResult } from '@ag-website-shared/components/theme-builder/themeImport';
import {
    type PageBackgroundColors,
    parseThemeCode,
    validateAndConvertToPreset,
} from '@ag-website-shared/theming/parseThemeCode';
import { type Preset, applyPreset } from '@ag-website-shared/theming/preset';
import type { Store } from '@ag-website-shared/theming/store';
import { _Theme } from 'ag-charts-community';
import type { AgChartThemeName } from 'ag-charts-community';

import { PUBLIC_PARAM_NAMES } from './chartsTheme';
import { setStoredPalette } from './paletteModel';
import { setImportedBaseTheme, setSelectedPresetId } from './presetModel';

/**
 * The inbound half of the theme snippet, mirroring `chartsThemeOutput.ts`: read
 * an `AgChartTheme` object literal back into the builder. `parseThemeCode` scans
 * for recognised names rather than parsing a shape, so params, palette and base
 * theme are all found in one pass. Param values need no conversion; the palette
 * does, its editor carrying bookkeeping a theme cannot.
 */

/** Charts' own preset backgrounds, so an imported theme lands on one of them. */
const CHARTS_PAGE_BACKGROUND_COLORS: PageBackgroundColors = { light: '#FAFAFA', dark: '#141B26' };

const PARAM_NAMES = new Set(PUBLIC_PARAM_NAMES);
const THEME_NAMES = new Set(Object.keys(_Theme.themes));

/** The two keys of a theme object that are not params. */
const PALETTE_KEY = 'palette';
const BASE_THEME_KEY = 'baseTheme';

const NO_THEME_ERROR =
    "Could not find an AG Charts theme. Expected code like: export const myTheme = { params: { backgroundColor: '#fff' } }";

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value != null && !Array.isArray(value);

const asColor = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined);

const toAccent = (value: unknown): PaletteAccent | undefined =>
    isPlainObject(value) ? { fill: asColor(value.fill), stroke: asColor(value.stroke) } : undefined;

/**
 * An `AgChartThemePalette` in the editor's shape. Fills and strokes are
 * index-paired, so a fill the editor cannot show - `fills` also admits gradients
 * and patterns - takes its stroke with it rather than shifting the rest along.
 */
const toEditorPalette = (value: unknown, warnings: string[]): Palette | undefined => {
    if (!isPlainObject(value)) {
        warnings.push(`Ignored palette: ${JSON.stringify(value)} is not a palette object`);
        return undefined;
    }

    const rawFills = Array.isArray(value.fills) ? value.fills : [];
    const rawStrokes = Array.isArray(value.strokes) ? value.strokes : [];
    const fills: string[] = [];
    const strokes: string[] = [];
    let droppedFills = 0;
    rawFills.forEach((fill, index) => {
        if (typeof fill !== 'string') {
            droppedFills++;
            return;
        }
        fills.push(fill);
        // A palette may carry fills alone, and AG Charts then outlines each
        // series in the colour it would have derived anyway.
        strokes.push(asColor(rawStrokes[index]) ?? deriveStroke(fill));
    });
    if (droppedFills > 0) {
        warnings.push(
            `Ignored ${droppedFills} palette ${droppedFills === 1 ? 'colour' : 'colours'} that ${droppedFills === 1 ? 'is' : 'are'} not a plain colour`
        );
    }

    const palette: Palette = {
        fills,
        strokes,
        // Inverting `toThemePalette`, which writes "strokes off" as a stroke
        // matching its fill.
        ...(strokesMatchFills(fills, strokes) ? { strokesEnabled: false } : {}),
        // `strokesDerived` is deliberately absent, meaning derived: a theme does
        // not record which strokes were chosen, and re-deriving to compare would
        // read a stock palette's hand-tuned strokes as chosen.
        ...accentEntries(value),
    };

    return paletteIsEmpty(palette) ? undefined : palette;
};

const strokesMatchFills = (fills: string[], strokes: string[]) =>
    fills.length > 0 && fills.every((fill, index) => strokes[index]?.toLowerCase() === fill.toLowerCase());

const accentEntries = (value: Record<string, unknown>) => {
    const entries: Partial<Pick<Palette, 'up' | 'down' | 'neutral'>> = {};
    for (const key of ['up', 'down', 'neutral'] as const) {
        const accent = toAccent(value[key]);
        if (accent) {
            entries[key] = accent;
        }
    }
    return entries;
};

const countedParams = (count: number) => `${count} theme parameter${count === 1 ? '' : 's'}`;

const andList = (items: string[]) =>
    items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

/**
 * Read pasted code as an AG Charts theme, for the shared import dialog. A theme
 * can be partial in every direction, so anything recognised is enough to apply
 * and the summary names what was found rather than counting params alone.
 */
export const validateChartsThemeCode = (code: string): ValidationResult => {
    if (!code.trim()) {
        return { status: 'empty', validParamCount: 0 };
    }

    const parseResult = parseThemeCode(code, {
        isRecognizedParam: (key) => PARAM_NAMES.has(key) || key === PALETTE_KEY || key === BASE_THEME_KEY,
        noParamsError: NO_THEME_ERROR,
    });
    if (!parseResult.success) {
        return { status: 'error', validParamCount: 0, error: parseResult.error };
    }

    const { [PALETTE_KEY]: rawPalette, [BASE_THEME_KEY]: rawBaseTheme, ...rawParams } = parseResult.params;
    const ownWarnings: string[] = [];

    const palette = rawPalette === undefined ? undefined : toEditorPalette(rawPalette, ownWarnings);

    let baseTheme: AgChartThemeName | undefined;
    if (rawBaseTheme !== undefined) {
        if (typeof rawBaseTheme === 'string' && THEME_NAMES.has(rawBaseTheme)) {
            baseTheme = rawBaseTheme as AgChartThemeName;
        } else {
            ownWarnings.push(`Ignored unknown base theme: ${JSON.stringify(rawBaseTheme)}`);
        }
    }

    const { preset, warnings } = validateAndConvertToPreset(
        { ...parseResult, params: rawParams },
        CHARTS_PAGE_BACKGROUND_COLORS
    );
    const paramCount = Object.keys(preset.params).length;
    const found = [
        ...(paramCount > 0 ? [countedParams(paramCount)] : []),
        ...(palette ? ['a palette'] : []),
        ...(baseTheme ? [`the ${baseTheme} base theme`] : []),
    ];

    const allWarnings = [...warnings, ...ownWarnings];
    if (found.length === 0) {
        return {
            status: 'error',
            validParamCount: 0,
            error: allWarnings.length > 0 ? allWarnings.join('\n') : NO_THEME_ERROR,
        };
    }

    const apply = (store: Store) => {
        // `applyPreset` clears every param the theme does not name - what makes this
        // an import rather than a merge - and the three below go the same way.
        applyPreset(store, preset as Preset);
        setStoredPalette(store, palette);
        setImportedBaseTheme(store, baseTheme);
        setSelectedPresetId(store, null);
    };

    const summary = `Found ${andList(found)}`;
    if (allWarnings.length === 0) {
        return { status: 'success', validParamCount: paramCount, summary, apply };
    }
    return { status: 'warning', validParamCount: paramCount, summary, apply, warnings: allWarnings };
};
