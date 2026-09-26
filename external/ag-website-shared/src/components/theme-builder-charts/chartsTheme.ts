import {
    EMPTY_PALETTE,
    type Palette,
    type PaletteAccent,
    type SeriesColor,
    fromSeriesColors,
} from '@ag-website-shared/components/theme-builder/palette';
import { _Theme } from 'ag-charts-community';
import type { AgChartThemeName, AgPaletteColors } from 'ag-charts-community';
import { createPart, createSharedTheme } from 'ag-stack';

import { themeLogger } from './themeLogger';

/**
 * AG Charts exposes no ag-stack `Theme`, which is where the shared model reads
 * its catalogue, defaults and `var(--ag-*)` from. So the builder drives a
 * *shadow* theme that styles nothing, while `chartsThemeOutput.ts` themes the
 * preview from the same values - hence everything here derives from the runtime.
 */

/** A value in an AG Charts param default: a literal, or a `$`-prefixed operation. */
type ChartsParamValue = unknown;

const isOperation = (value: unknown): value is Record<string, any> =>
    typeof value === 'object' && value != null && !Array.isArray(value);

/** Pull the param name out of a `{ $ref }`, or undefined for anything else. */
const refName = (value: unknown): string | undefined =>
    isOperation(value) && typeof value.$ref === 'string' ? value.$ref : undefined;

/**
 * AG Charts writes its variables as `--ag-charts-*` where the shadow theme
 * declares ag-stack's `--ag-*`, so a raw-CSS default referencing the former
 * (e.g. `focusShadow`) resolves to nothing in the editors unless retargeted.
 */
const retargetCssVariables = (value: string) => value.replaceAll('var(--ag-charts-', 'var(--ag-');

/**
 * Convert one AG Charts param default into the equivalent ag-stack param value.
 * Unknown operations are dropped with a warning, so a new one surfaces as a
 * missing default rather than a wrong colour.
 */
export const toStackParamValue = (property: string, value: ChartsParamValue): unknown => {
    if (typeof value === 'string') {
        return retargetCssVariables(value);
    }
    if (!isOperation(value)) {
        // numbers (px lengths and font weights), booleans, and font-family arrays
        return value;
    }

    if ('$ref' in value) {
        return { ref: value.$ref };
    }

    if ('$foregroundBackgroundMix' in value) {
        // Color.mix(foreground, background, 1 - ratio) - i.e. `ratio` is the
        // weight of the foreground colour, which is exactly ag-stack's `mix`.
        return { ref: 'foregroundColor', mix: value.$foregroundBackgroundMix, onto: 'backgroundColor' };
    }

    if ('$mix' in value) {
        const [a, b, t] = value.$mix as [unknown, unknown, number];
        const ref = refName(a);
        const onto = refName(b);
        if (ref != null && onto != null) {
            // Color.mix(a, b, t) lerps a -> b, so `a` carries a weight of 1 - t.
            return { ref, mix: 1 - t, onto };
        }
        console.warn(`[charts theme builder] cannot express $mix for "${property}" as a param reference`);
        return undefined;
    }

    // Composite params such as `buttonBorder: { color, width }`, whose members
    // are themselves operations.
    return Object.fromEntries(
        Object.entries(value).map(([key, member]) => [key, toStackParamValue(`${property}.${key}`, member)])
    );
};

/**
 * AG Charts' public catalogue. Read from the static defaults rather than a theme
 * instance, whose `params` also carry private ones such as `focusColor`.
 */
export const PUBLIC_PARAM_NAMES = Object.keys(_Theme.ChartTheme.getDefaultPublicParameters());

const getThemeInstance = (themeName: AgChartThemeName) => {
    const theme = _Theme.themes[themeName]?.();
    if (!theme) {
        throw new Error(`Unknown AG Charts theme "${themeName}"`);
    }
    return theme;
};

/** A stock theme's public params, in ag-stack's value format. */
export const getStackParams = (themeName: AgChartThemeName): Record<string, unknown> => {
    // Read through the public catalogue, `params` including private ones.
    const params = getThemeInstance(themeName).params as Record<string, unknown>;
    return Object.fromEntries(
        PUBLIC_PARAM_NAMES.map((property) => [property, toStackParamValue(property, params[property])])
    );
};

/** An accent colour pair, narrowed to the plain colours the editor can show. */
const toAccent = ({ fill, stroke }: AgPaletteColors): PaletteAccent => ({
    fill: typeof fill === 'string' ? fill : undefined,
    stroke,
});

/**
 * A stock theme's palette, in the shared editor's shape. `fills` also admits
 * gradients and patterns, which no colour picker could edit, so such a slot is
 * dropped along with its paired stroke.
 */
export const getPalette = (themeName: AgChartThemeName): Palette => {
    const { fills, strokes, up, down, neutral } = getThemeInstance(themeName).palette;
    const series: SeriesColor[] = [];
    fills.forEach((fill, index) => {
        if (typeof fill !== 'string') {
            console.warn(`[charts theme builder] Theme "${themeName}" palette fill ${index} is not a plain colour`);
            return;
        }
        series.push({ fill, stroke: strokes[index] ?? fill });
    });
    return fromSeriesColors(
        { ...EMPTY_PALETTE, up: toAccent(up), down: toAccent(down), neutral: toAccent(neutral) },
        series
    );
};

export const DEFAULT_THEME_NAME: AgChartThemeName = 'ag-default';

export const CHARTS_PARAM_DEFAULTS = getStackParams(DEFAULT_THEME_NAME);

/**
 * The shadow theme the shared model reads from. `createSharedTheme` starts empty,
 * so the catalogue is exactly AG Charts' params and nothing else.
 */
export const chartsShadowTheme = createSharedTheme(themeLogger).withPart(
    // Keyed by AG Charts' names, which ag-stack cannot type against its own
    // catalogue; the values are validated at runtime through `themeLogger`.
    createPart({ feature: 'agCharts', params: CHARTS_PARAM_DEFAULTS as never })
);
