import type { FontFamilyValue } from '@ag-website-shared/theming/api';
import type { Preset as SharedPreset } from '@ag-website-shared/theming/preset';
import type { ThemeParams } from '@ag-website-shared/theming/utils';

import { DM_SANS, FRAUNCES, IBM_PLEX_MONO, INTER, MERRIWEATHER, SPACE_GROTESK } from './fonts';

// Studio keeps its own Preset shape (light/dark variants) rather than the shared
// single-variant Preset, because its presets are authored per colour scheme. The
// active variant is converted to a shared Preset at apply time via toSharedPreset.
export type StudioParamMap = Record<string, string | number | object>;

export interface PresetVariant {
    accent: string;
    background: string;
    params: StudioParamMap;
}

export interface StudioPreset {
    id: string;
    label: string;
    // Widget borders are page-layout state, not a theme param, so a preset can't
    // enable them through its `params`. Opt in here and the Theme Builder turns
    // the preview's widget border on for this preset only (High Contrast uses it
    // as the sole widget-vs-canvas separation cue, in place of a fill).
    widgetBorder?: boolean;
    variants: {
        light: PresetVariant;
        dark: PresetVariant;
    };
}

type Mode = 'light' | 'dark';
type ChartPalette = Record<string, Record<Mode, string[]>>;

const CHART_PALETTES: ChartPalette = {
    midnight: {
        light: ['#2E6BC6', '#1A9E8F', '#D4952B', '#7C8BA1'],
        dark: ['#4A90E2', '#2DBFAC', '#E8AA42', '#95A3B8'],
    },
    forest: {
        light: ['#2D7A50', '#B8960E', '#C46A3B', '#6B9A7E'],
        dark: ['#3DB06F', '#D4B020', '#E08050', '#88BFA0'],
    },
    slate: {
        light: ['#8B6834', '#B85C3A', '#6E7A3A', '#8C7E72'],
        dark: ['#C49352', '#D87A55', '#94A458', '#AE9E90'],
    },
    arctic: {
        light: ['#0078D4', '#0EA5A0', '#6B5CE7', '#708CA8'],
        dark: ['#3CA5F5', '#30C8C0', '#8B7EF0', '#92ACC4'],
    },
    charcoal: {
        light: ['#E05225', '#D49B20', '#2A9D8F', '#7A7570'],
        dark: ['#F06840', '#EAB438', '#3DBFAE', '#9A9590'],
    },
    plum: {
        light: ['#7B3FA0', '#C44E72', '#2E8E88', '#8A7090'],
        dark: ['#A65CD0', '#E06690', '#40B8B0', '#AA90B4'],
    },
    // Both modes use a 5-hue luminance staircase (bright, deep, bright, deep,
    // bright): consecutive series alternate light and dark tiers so each keeps
    // >=3:1 luminance contrast against its neighbours, staying distinct in
    // greyscale and monochromatic vision rather than by hue alone. The 3:1
    // non-text contrast floor against the background caps the usable luminance
    // range to roughly two tiers, hence 5 hues rather than more. Light and dark
    // share the same hue families (blue, wine, green, navy, ochre) so a series
    // keeps its identity when the mode is switched.
    highContrast: {
        light: ['#1F8FB0', '#5A0A2E', '#3F9A1E', '#00224E', '#B77A00'],
        dark: ['#58E8EC', '#884C68', '#78E05C', '#2C6088', '#FCB004'],
    },
};

function paletteParams(themeKey: keyof typeof CHART_PALETTES, mode: Mode): StudioParamMap {
    const colors = CHART_PALETTES[themeKey][mode];
    const out: StudioParamMap = {};
    colors.forEach((color, i) => {
        out[`chartPaletteFills${i + 1}Color`] = color;
    });
    return out;
}

// Set every font surface the studio renders so a preset's font reaches KPI
// captions and chart labels alongside the grid itself. `family` must come from
// ./fonts.
function sharedFonts(family: FontFamilyValue, size: number, headerWeight: number | string): StudioParamMap {
    return {
        fontFamily: family,
        fontSize: size,
        headerFontFamily: family,
        headerFontSize: size,
        headerFontWeight: headerWeight,
        gridFontFamily: family,
        gridFontSize: size,
        gridHeaderFontFamily: family,
        gridHeaderFontSize: size,
        gridHeaderFontWeight: headerWeight,
        gridCellFontFamily: family,
        gridCellFontSize: size,
        chartFontFamily: family,
        studioCanvasFontFamily: family,
        studioWidgetTitleFontFamily: family,
        studioWidgetSubtitleFontFamily: family,
        studioWidgetCaptionFontFamily: family,
        studioWidgetCaptionFontSize: size,
    };
}

const midnightShared: StudioParamMap = {
    ...sharedFonts(INTER, 13, 600),
    spacing: 6,
    borderRadius: 4,
    borderWidth: 1,
};

const forestShared: StudioParamMap = {
    ...sharedFonts(MERRIWEATHER, 13, 700),
    spacing: 8,
    borderRadius: 10,
    borderWidth: 1,
};

const slateShared: StudioParamMap = {
    ...sharedFonts(DM_SANS, 14, 500),
    spacing: 8,
    borderRadius: 8,
    borderWidth: 0,
};

const arcticShared: StudioParamMap = {
    ...sharedFonts(IBM_PLEX_MONO, 12, 600),
    spacing: 6,
    borderRadius: 2,
    borderWidth: 2,
};

const charcoalShared: StudioParamMap = {
    ...sharedFonts(SPACE_GROTESK, 14, 700),
    spacing: 8,
    borderRadius: 12,
    borderWidth: 2,
    iconSize: 18,
};

const plumShared: StudioParamMap = {
    ...sharedFonts(FRAUNCES, 13, 600),
    spacing: 8,
    borderRadius: 8,
    borderWidth: 1,
};

export const PRESETS: StudioPreset[] = [
    {
        // Empty params fall through to AG Studio's built-in mode-aware defaults.
        id: 'default',
        label: 'Default',
        variants: {
            light: { accent: '#2196F3', background: '#FFFFFF', params: {} },
            dark: { accent: '#2196F3', background: '#181D1F', params: {} },
        },
    },
    {
        // Mirrors VS Code's built-in high-contrast themes: a vivid focus/accent
        // hue (orange on black, blue on white) and a strong contrast border
        // (cyan on black, deep blue on white) so every surface is outlined
        // rather than relying on soft grey chrome.
        id: 'highContrast',
        label: 'High Contrast',
        widgetBorder: true,
        variants: {
            light: {
                accent: '#006BBD',
                background: '#FFFFFF',
                params: {
                    backgroundColor: '#FFFFFF',
                    foregroundColor: '#292929',
                    textColor: '#292929',
                    subtleTextColor: '#292929',
                    accentColor: '#006BBD',
                    borderColor: '#0F4A85',
                    // Canvas and widgets are both pure white, so the page reads as a
                    // single white surface and widgets are separated only by the
                    // contrast border. The canvas would otherwise default to a 4%
                    // grey tint; forcing it white also gives the chart palette its
                    // best contrast (it is tuned against #FFFFFF). Widget fill stays
                    // the opaque backgroundColor default so grid total rows are solid.
                    studioCanvasBackgroundColor: '#FFFFFF',
                    studioWidgetBorder: [1, '#0F4A85'],
                    // Panel section dividers default to ~8% foreground; lift them to
                    // the contrast border so they match the axes and widget outlines.
                    studioPanelSectionBorderColor: '#0F4A85',
                    headerTextColor: '#292929',
                    invalidColor: '#B5200D',
                    focusShadow: { spread: 2, color: '#006BBD' },
                    studioWidgetTitleTextColor: '#292929',
                    studioWidgetSubtitleTextColor: '#292929',
                    studioWidgetCaptionTextColor: '#292929',
                    gridCellTextColor: '#292929',
                    chartTextColor: '#292929',
                    chartSubtleTextColor: '#292929',
                    chartAxisLineColor: '#0F4A85',
                    chartGridLineColor: '#D4D4D4',
                    browserColorScheme: 'light',
                    ...paletteParams('highContrast', 'light'),
                },
            },
            dark: {
                accent: '#F38518',
                background: '#000000',
                params: {
                    backgroundColor: '#000000',
                    foregroundColor: '#FFFFFF',
                    textColor: '#FFFFFF',
                    subtleTextColor: '#FFFFFF',
                    accentColor: '#F38518',
                    borderColor: '#6FC3DF',
                    // Widget fill defaults to backgroundColor (#000000), which
                    // already equals the dark canvas - opaque, no surface step, so
                    // the contrast border alone separates widgets (see light).
                    studioWidgetBorder: [1, '#6FC3DF'],
                    studioPanelSectionBorderColor: '#6FC3DF',
                    headerTextColor: '#FFFFFF',
                    invalidColor: '#F48771',
                    focusShadow: { spread: 2, color: '#F38518' },
                    studioWidgetTitleTextColor: '#FFFFFF',
                    studioWidgetSubtitleTextColor: '#FFFFFF',
                    studioWidgetCaptionTextColor: '#FFFFFF',
                    gridCellTextColor: '#FFFFFF',
                    chartTextColor: '#FFFFFF',
                    chartSubtleTextColor: '#FFFFFF',
                    chartAxisLineColor: '#6FC3DF',
                    chartGridLineColor: '#404040',
                    browserColorScheme: 'dark',
                    ...paletteParams('highContrast', 'dark'),
                },
            },
        },
    },
    {
        id: 'midnight',
        label: 'Midnight',
        variants: {
            light: {
                accent: '#2E6BC6',
                background: '#F4F7FA',
                params: {
                    ...midnightShared,
                    backgroundColor: '#F4F7FA',
                    foregroundColor: '#1A2B42CC',
                    accentColor: '#2E6BC6',
                    borderColor: '#C8D3E0',
                    textColor: '#1A2B42',
                    subtleTextColor: '#5A7091',
                    browserColorScheme: 'light',
                    ...paletteParams('midnight', 'light'),
                },
            },
            dark: {
                accent: '#4A90E2',
                background: '#0F1B2D',
                params: {
                    ...midnightShared,
                    backgroundColor: '#0F1B2D',
                    foregroundColor: '#C8D8ECCC',
                    accentColor: '#4A90E2',
                    borderColor: '#1E3250',
                    textColor: '#C8D8EC',
                    subtleTextColor: '#6B8AAE',
                    browserColorScheme: 'dark',
                    ...paletteParams('midnight', 'dark'),
                },
            },
        },
    },
    {
        id: 'forest',
        label: 'Forest',
        variants: {
            light: {
                accent: '#2D7A50',
                background: '#F5F8F5',
                params: {
                    ...forestShared,
                    backgroundColor: '#F5F8F5',
                    foregroundColor: '#1C3326CC',
                    accentColor: '#2D7A50',
                    borderColor: '#C2D5C8',
                    textColor: '#1C3326',
                    subtleTextColor: '#5C8A6E',
                    browserColorScheme: 'light',
                    ...paletteParams('forest', 'light'),
                },
            },
            dark: {
                accent: '#3DB06F',
                background: '#111F18',
                params: {
                    ...forestShared,
                    backgroundColor: '#111F18',
                    foregroundColor: '#B8D4C4CC',
                    accentColor: '#3DB06F',
                    borderColor: '#1E3D2C',
                    textColor: '#B8D4C4',
                    subtleTextColor: '#5F9A78',
                    browserColorScheme: 'dark',
                    ...paletteParams('forest', 'dark'),
                },
            },
        },
    },
    {
        id: 'slate',
        label: 'Slate',
        variants: {
            light: {
                accent: '#8B6834',
                background: '#FAF9F7',
                params: {
                    ...slateShared,
                    backgroundColor: '#FAF9F7',
                    foregroundColor: '#3C3836CC',
                    accentColor: '#8B6834',
                    borderColor: '#E4E0D8',
                    textColor: '#3C3836',
                    subtleTextColor: '#7A756E',
                    cardShadow: { offsetX: 0, offsetY: 1, radius: 3, color: '#3C383612' },
                    dropdownShadow: { offsetX: 0, offsetY: 4, radius: 12, color: '#3C383618' },
                    browserColorScheme: 'light',
                    ...paletteParams('slate', 'light'),
                },
            },
            dark: {
                accent: '#C49352',
                background: '#1D1B19',
                params: {
                    ...slateShared,
                    backgroundColor: '#1D1B19',
                    foregroundColor: '#D4CFC7CC',
                    accentColor: '#C49352',
                    borderColor: '#3A3632',
                    textColor: '#D4CFC7',
                    subtleTextColor: '#8A847C',
                    cardShadow: { offsetX: 0, offsetY: 1, radius: 3, color: '#00000025' },
                    dropdownShadow: { offsetX: 0, offsetY: 4, radius: 12, color: '#00000030' },
                    browserColorScheme: 'dark',
                    ...paletteParams('slate', 'dark'),
                },
            },
        },
    },
    {
        id: 'arctic',
        label: 'Arctic',
        variants: {
            light: {
                accent: '#0078D4',
                background: '#F0F5FA',
                params: {
                    ...arcticShared,
                    backgroundColor: '#F0F5FA',
                    foregroundColor: '#2A3F55CC',
                    accentColor: '#0078D4',
                    borderColor: '#BCCFE0',
                    textColor: '#2A3F55',
                    subtleTextColor: '#6888A5',
                    browserColorScheme: 'light',
                    ...paletteParams('arctic', 'light'),
                },
            },
            dark: {
                accent: '#3CA5F5',
                background: '#0C1620',
                params: {
                    ...arcticShared,
                    backgroundColor: '#0C1620',
                    foregroundColor: '#B0C8DDCC',
                    accentColor: '#3CA5F5',
                    borderColor: '#1A3048',
                    textColor: '#B0C8DD',
                    subtleTextColor: '#5D8AAD',
                    browserColorScheme: 'dark',
                    ...paletteParams('arctic', 'dark'),
                },
            },
        },
    },
    {
        id: 'charcoal',
        label: 'Charcoal',
        variants: {
            light: {
                accent: '#E05225',
                background: '#F5F5F3',
                params: {
                    ...charcoalShared,
                    backgroundColor: '#F5F5F3',
                    foregroundColor: '#2C2C2CCC',
                    accentColor: '#E05225',
                    borderColor: '#D0D0CC',
                    textColor: '#2C2C2C',
                    subtleTextColor: '#737370',
                    browserColorScheme: 'light',
                    ...paletteParams('charcoal', 'light'),
                },
            },
            dark: {
                accent: '#F06840',
                background: '#171717',
                params: {
                    ...charcoalShared,
                    backgroundColor: '#171717',
                    foregroundColor: '#CCCCC8CC',
                    accentColor: '#F06840',
                    borderColor: '#333330',
                    textColor: '#CCCCC8',
                    subtleTextColor: '#7A7A76',
                    browserColorScheme: 'dark',
                    ...paletteParams('charcoal', 'dark'),
                },
            },
        },
    },
    {
        id: 'plum',
        label: 'Plum',
        variants: {
            light: {
                accent: '#7B3FA0',
                background: '#F8F5FA',
                params: {
                    ...plumShared,
                    backgroundColor: '#F8F5FA',
                    foregroundColor: '#2D1F3DCC',
                    accentColor: '#7B3FA0',
                    borderColor: '#D4C6DE',
                    textColor: '#2D1F3D',
                    subtleTextColor: '#7E6A90',
                    browserColorScheme: 'light',
                    ...paletteParams('plum', 'light'),
                },
            },
            dark: {
                accent: '#A65CD0',
                background: '#150F1E',
                params: {
                    ...plumShared,
                    backgroundColor: '#150F1E',
                    foregroundColor: '#C8B8D8CC',
                    accentColor: '#A65CD0',
                    borderColor: '#2E2240',
                    textColor: '#C8B8D8',
                    subtleTextColor: '#7A6690',
                    browserColorScheme: 'dark',
                    ...paletteParams('plum', 'dark'),
                },
            },
        },
    },
];

/**
 * Convert the mode-appropriate variant of a Studio preset into the shared,
 * single-variant Preset consumed by applyPreset(). Studio's catalog is a
 * superset of grid's ThemeParams and studioTheme.withParams validates the keys
 * at apply time, so the grid-typed Preset cannot statically express them.
 */
export function toSharedPreset(preset: StudioPreset, isDark: boolean): SharedPreset {
    const variant = isDark ? preset.variants.dark : preset.variants.light;
    return {
        pageBackgroundColor: variant.background,
        params: variant.params as unknown as Partial<ThemeParams>,
    };
}
