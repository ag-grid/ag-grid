import type { Palette } from '@ag-website-shared/components/theme-builder/palette';
import type { Preset } from '@ag-website-shared/theming/preset';
import type { AgChartThemeName } from 'ag-charts-community';

import { getPalette } from './chartsTheme';

/**
 * The starting points offered above the preview. Hand-authored as grid's are,
 * since the stock themes differ from `ag-default` by little more than palette
 * and a starting point has to propose a look. Each is pinned to light or dark,
 * so the site's theme toggle cannot redesign a theme mid-edit. `Default` and
 * `Midnight` are the exceptions - no overrides, so a chart with no theme.
 */

/** `[fill, stroke]` pairs: an outline is picked against its fill, not separately. */
type ColorPair = [fill: string, stroke: string];

interface PaletteSpec {
    /** At least eight: the preset thumbnails render eight series. */
    series: ColorPair[];
    up: ColorPair;
    down: ColorPair;
    neutral: ColorPair;
}

const toPalette = ({ series, up, down, neutral }: PaletteSpec): Palette => ({
    fills: series.map(([fill]) => fill),
    strokes: series.map(([, stroke]) => stroke),
    up: { fill: up[0], stroke: up[1] },
    down: { fill: down[0], stroke: down[1] },
    neutral: { fill: neutral[0], stroke: neutral[1] },
});

export type ChartsPreset = {
    id: string;
    label: string;
    /**
     * Light or dark, fixed. Carries the theme-level decisions the param API does
     * not expose, so a dark design on `ag-default` gets white slice separators.
     */
    baseTheme: AgChartThemeName;
    /**
     * The page the chart is imagined to sit on. Not part of the theme and not
     * drawn anywhere yet, but required by the shared `Preset`, so each preset
     * names a colour that belongs with it rather than a placeholder.
     */
    pageBackgroundColor: string;
    params: Record<string, unknown>;
    palette: Palette;
};

/** Ordered light, dark, light, dark, so no two neighbouring cards look alike. */
export const PRESETS: ChartsPreset[] = [
    {
        id: 'default',
        label: 'Default',
        baseTheme: 'ag-default',
        pageBackgroundColor: '#FAFAFA',
        params: {},
        palette: getPalette('ag-default'),
    },
    {
        id: 'midnight',
        label: 'Midnight',
        baseTheme: 'ag-default-dark',
        pageBackgroundColor: '#141B26',
        params: {},
        palette: getPalette('ag-default-dark'),
    },
    {
        // Airy and low-contrast: white series area, grid lines barely above the
        // background, and the weight carried by the series colours alone.
        id: 'coastal',
        label: 'Coastal',
        baseTheme: 'ag-default',
        pageBackgroundColor: '#F1F5F9',
        params: {
            fontFamily: { googleFont: 'Inter' },
            fontSize: 12,
            fontWeight: 500,
            backgroundColor: '#FFFFFF',
            foregroundColor: '#334155',
            accentColor: '#0EA5E9',
            subtleTextColor: '#94A3B8',
            axisLineColor: '#E2E8F0',
            gridLineColor: '#F1F5F9',
            borderColor: '#E2E8F0',
            borderRadius: 8,
            chartPadding: 24,
        },
        palette: toPalette({
            series: [
                ['#0EA5E9', '#0284C7'],
                ['#14B8A6', '#0D9488'],
                ['#6366F1', '#4F46E5'],
                ['#F43F5E', '#E11D48'],
                ['#F59E0B', '#D97706'],
                ['#8B5CF6', '#7C3AED'],
                ['#10B981', '#059669'],
                ['#64748B', '#475569'],
            ],
            up: ['#10B981', '#059669'],
            down: ['#F43F5E', '#E11D48'],
            neutral: ['#64748B', '#475569'],
        }),
    },
    {
        // Phosphor on black: monospaced type, a near-black series area and
        // green-led first slots, widening out so eight can be told apart.
        id: 'terminal',
        label: 'Terminal',
        baseTheme: 'ag-default-dark',
        pageBackgroundColor: '#080D0A',
        params: {
            fontFamily: { googleFont: 'IBM Plex Mono' },
            fontSize: 12,
            fontWeight: 500,
            backgroundColor: '#0C1310',
            foregroundColor: '#7DF9A6',
            accentColor: '#39FF88',
            subtleTextColor: '#3E8F5F',
            axisLineColor: '#2A5C3D',
            gridLineColor: '#16301F',
            borderColor: '#2A5C3D',
            borderRadius: 0,
            chartPadding: 16,
        },
        palette: toPalette({
            series: [
                ['#39D353', '#7EE787'],
                ['#2DD4BF', '#7FF0E2'],
                ['#A3E635', '#CBEF7A'],
                ['#FACC15', '#FDE68A'],
                ['#F97316', '#FDBA74'],
                ['#38BDF8', '#93D9FC'],
                ['#C084FC', '#DDB4FE'],
                ['#94A3B8', '#CBD5E1'],
            ],
            up: ['#39D353', '#7EE787'],
            down: ['#F97316', '#FDBA74'],
            neutral: ['#94A3B8', '#CBD5E1'],
        }),
    },
    {
        // Printed almanac: cream stock, a serif face, pigments rather than
        // screen colours, square corners and generous padding.
        id: 'vintage',
        label: 'Vintage',
        baseTheme: 'ag-default',
        pageBackgroundColor: '#F0DFC0',
        params: {
            fontFamily: { googleFont: 'Merriweather' },
            fontSize: 12,
            backgroundColor: '#FBF0DC',
            foregroundColor: '#4A3524',
            accentColor: '#B4462E',
            subtleTextColor: '#8A6F52',
            axisLineColor: '#C9AC81',
            gridLineColor: '#E6D3B0',
            borderColor: '#D6BC93',
            borderRadius: 0,
            chartPadding: 28,
        },
        palette: toPalette({
            series: [
                ['#B4462E', '#7E2E1C'],
                ['#D98E33', '#A9651C'],
                ['#2E6E7E', '#1B4C58'],
                ['#6E8B4E', '#4C6434'],
                ['#8C5A6B', '#653E4B'],
                ['#C9A227', '#9A7A16'],
                ['#A85C32', '#7A3F20'],
                ['#7C6A4E', '#584A34'],
            ],
            up: ['#6E8B4E', '#4C6434'],
            down: ['#B4462E', '#7E2E1C'],
            neutral: ['#7C6A4E', '#584A34'],
        }),
    },
    {
        // The loudest of the set, and the point of including it: proof that the
        // param API can carry a theme nobody would call corporate.
        id: 'neon',
        label: 'Neon',
        baseTheme: 'ag-default-dark',
        pageBackgroundColor: '#0B0918',
        params: {
            fontFamily: { googleFont: 'Roboto' },
            fontSize: 13,
            fontWeight: 500,
            backgroundColor: '#161228',
            foregroundColor: '#EDE9FE',
            accentColor: '#F472B6',
            subtleTextColor: '#8B80B8',
            axisLineColor: '#3B3266',
            gridLineColor: '#241E42',
            borderColor: '#3B3266',
            borderRadius: 12,
            chartPadding: 24,
        },
        palette: toPalette({
            series: [
                ['#FF4FD8', '#FF93E7'],
                ['#00E5FF', '#7BF2FF'],
                ['#7C4DFF', '#B39BFF'],
                ['#00FFA3', '#7BFFCE'],
                ['#FFE34F', '#FFF0A0'],
                ['#FF7847', '#FFAE8C'],
                ['#4D8BFF', '#9BBDFF'],
                ['#C77DFF', '#E0B6FF'],
            ],
            up: ['#00FFA3', '#7BFFCE'],
            down: ['#FF3D71', '#FF8AA8'],
            neutral: ['#8B80B8', '#B7AEDA'],
        }),
    },
    {
        // Drafting paper: a blue-tinted ground, monospaced labels, hairline
        // rules. The orange in slot two stops eight cool colours collapsing.
        id: 'blueprint',
        label: 'Blueprint',
        baseTheme: 'ag-default',
        pageBackgroundColor: '#D6E3F2',
        params: {
            fontFamily: { googleFont: 'IBM Plex Mono' },
            fontSize: 11,
            backgroundColor: '#EAF1FA',
            foregroundColor: '#12395C',
            accentColor: '#0B69A3',
            subtleTextColor: '#5B7C99',
            axisLineColor: '#7FA3C4',
            gridLineColor: '#C3D6E9',
            borderColor: '#7FA3C4',
            borderRadius: 0,
            chartPadding: 20,
        },
        palette: toPalette({
            series: [
                ['#0B4F80', '#07314F'],
                ['#E07A3F', '#AE5623'],
                ['#2E8B8B', '#1C5C5C'],
                ['#5C6E7F', '#3C4A57'],
                ['#3FA9D9', '#2A7FA6'],
                ['#8A6F3F', '#5F4B27'],
                ['#6B8F4E', '#4A6634'],
                ['#9BB8CE', '#6D8DA5'],
            ],
            up: ['#6B8F4E', '#4A6634'],
            down: ['#E07A3F', '#AE5623'],
            neutral: ['#5C6E7F', '#3C4A57'],
        }),
    },
    {
        // Warm charcoal rather than navy, to stay distinct from Midnight at card
        // size. The restrained dark option, against Neon and Terminal.
        id: 'graphite',
        label: 'Graphite',
        baseTheme: 'ag-default-dark',
        pageBackgroundColor: '#17181A',
        params: {
            fontFamily: { googleFont: 'Lato' },
            fontSize: 13,
            backgroundColor: '#212327',
            foregroundColor: '#E4E4E7',
            accentColor: '#E4A853',
            subtleTextColor: '#8E9096',
            axisLineColor: '#3A3D43',
            gridLineColor: '#2A2D32',
            borderColor: '#3A3D43',
            borderRadius: 6,
            chartPadding: 28,
        },
        palette: toPalette({
            series: [
                ['#E4A853', '#F0C588'],
                ['#5B8FF9', '#93B6FB'],
                ['#5AD8A6', '#93E7C4'],
                ['#D8524F', '#E68B89'],
                ['#9270CA', '#B69DDC'],
                ['#7ECFE0', '#A9E1EC'],
                ['#E86BA0', '#F09FC3'],
                ['#5D7092', '#8B99B3'],
            ],
            up: ['#5AD8A6', '#93E7C4'],
            down: ['#D8524F', '#E68B89'],
            neutral: ['#5D7092', '#8B99B3'],
        }),
    },
];

const presetById = (id: string) => PRESETS.find((preset) => preset.id === id)!;

/** Where a first visit starts, chosen once from the site's theme at mount. */
export const DEFAULT_PRESET = presetById('default');
export const DEFAULT_DARK_PRESET = presetById('midnight');

export const findPreset = (id: string | null | undefined): ChartsPreset | undefined =>
    PRESETS.find((preset) => preset.id === id);

/**
 * The params half, for the shared preset machinery. The palette is not part of
 * the shared `Preset` - it has no counterpart in the flat param model - so the
 * host applies it separately, from `ChartsPreset.palette`.
 */
export const toSharedPreset = ({ pageBackgroundColor, params }: ChartsPreset): Preset => ({
    pageBackgroundColor,
    params,
});
