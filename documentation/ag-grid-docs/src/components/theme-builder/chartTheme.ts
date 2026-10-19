import {
    EMPTY_PALETTE,
    type Palette,
    fromThemePalette,
    toThemePalette,
} from '@ag-website-shared/components/theme-builder/palette';
import { atomWithJSONStorage } from '@ag-website-shared/theming/JSONStorage';
import { RGBAColor } from '@ag-website-shared/theming/RGBAColor';
import { addChangedModelItem } from '@ag-website-shared/theming/changed-model-items';
import { type RenderedThemeInfo, useRenderedThemeInfo } from '@ag-website-shared/theming/rendered-theme';
import type { Store } from '@ag-website-shared/theming/store';
import { getThemeDefaultParams, paramToVariableName, reinterpretCSSValue } from '@ag-website-shared/theming/utils';
import { _Theme } from 'ag-charts-community';
import type { AgChartTheme, AgChartThemeName, AgChartThemeParams } from 'ag-charts-community';
import { useAtom, useAtomValue, useStore } from 'jotai';
import { useCallback, useMemo } from 'react';

export const CHART_THEME_NAME = 'myChartTheme';

const BASE_THEME: AgChartThemeName = 'ag-default';

export const getChartThemePalette = (themeName: AgChartThemeName): Palette =>
    fromThemePalette(_Theme.getChartTheme(themeName).palette) ?? EMPTY_PALETTE;

const DEFAULT_PALETTE = getChartThemePalette(BASE_THEME);

/** No grid param holds a series palette, so it has its own atom. Unset means the base theme's palette shows through. */
const paletteAtom = atomWithJSONStorage<Palette | undefined>('grid-chart-palette', undefined);

export const useChartPalette = () => {
    const store = useStore();
    const [stored, setStored] = useAtom(paletteAtom);
    // No ParamModel for the provider's listeners to watch, so an edit reports itself.
    const setPalette = useCallback(
        (palette: Palette) => {
            setStored(palette);
            addChangedModelItem(store, 'grid-chart-palette');
        },
        [store, setStored]
    );
    return [stored ?? DEFAULT_PALETTE, setPalette] as const;
};

export const setStoredChartPalette = (store: Store, palette: Palette | undefined) => store.set(paletteAtom, palette);

/** Resolved to literal values, as AG Charts reads a CSS variable once rather than following it. */
const resolveParam = (param: string, type: 'color' | 'fontFamily') =>
    reinterpretCSSValue(`var(${paramToVariableName(param)})`, type) || undefined;

const resolveColor = (param: string) => {
    const value = resolveParam(param, 'color');
    return value ? RGBAColor.parseCss(value)?.toCSSHex() : undefined;
};

type ChartFontFamily = NonNullable<AgChartThemeParams['fontFamily']>;

const CSS_WIDE_KEYWORDS = new Set(['inherit', 'initial', 'unset', 'revert', 'revert-layer']);

const isFontName = (value: unknown) =>
    (typeof value === 'string' && !CSS_WIDE_KEYWORDS.has(value.trim().toLowerCase())) ||
    (typeof value === 'object' && value != null && 'googleFont' in value && typeof value.googleFont === 'string');

const isChartFontFamily = (value: unknown): value is ChartFontFamily =>
    isFontName(value) || (Array.isArray(value) && value.every(isFontName));

/** The grid's own font value, which charts share the shape of, so the export reads as the user wrote it. */
const resolveFontFamily = (theme: RenderedThemeInfo['theme']): ChartFontFamily | undefined => {
    const { fontFamily } = getThemeDefaultParams(theme);
    // A reference to another param or a CSS keyword falls back to the value it resolves to.
    return isChartFontFamily(fontFamily) ? fontFamily : resolveParam('fontFamily', 'fontFamily');
};

const buildChartTheme = (theme: RenderedThemeInfo['theme'], palette: Palette | undefined): AgChartTheme => {
    const params: AgChartThemeParams = {
        backgroundColor: resolveColor('backgroundColor'),
        foregroundColor: resolveColor('foregroundColor'),
        accentColor: resolveColor('accentColor'),
        fontFamily: resolveFontFamily(theme),
    };
    return {
        baseTheme: BASE_THEME,
        ...(palette ? { palette: toThemePalette(palette) } : {}),
        params: Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined)),
    };
};

/** Stable while its content is, since most param edits leave the chart theme unchanged. */
export const useChartTheme = (): AgChartTheme => {
    const { theme } = useRenderedThemeInfo();
    const json = JSON.stringify(buildChartTheme(theme, useAtomValue(paletteAtom)));
    return useMemo<AgChartTheme>(() => JSON.parse(json), [json]);
};

export const CHART_THEMES = [CHART_THEME_NAME];

export const renderChartThemeCode = (chartTheme: AgChartTheme): string => {
    const options = { customChartThemes: { [CHART_THEME_NAME]: chartTheme }, chartThemes: CHART_THEMES };
    const optionsJS = JSON.stringify(options, null, 4).replaceAll(/^(\s+)"([^"]+)":/gm, '$1$2:');
    return `// to style integrated charts to match, add these to your grid options\nexport const myChartThemeOptions = ${optionsJS};\n`;
};
