import { EMPTY_PALETTE, type Palette, fromSeriesColors } from '@ag-website-shared/components/theme-builder/palette';
import { type Preset, applyPreset } from '@ag-website-shared/theming/preset';
import type { Store } from '@ag-website-shared/theming/store';

import { iconSetAlpine, iconSetQuartzLight } from 'ag-grid-community';

import { getChartThemePalette, setStoredChartPalette } from './chartTheme';

export type GridPreset = Preset & { chartPalette?: Palette };

export const applyGridPreset = (store: Store, preset: GridPreset) => {
    applyPreset(store, preset);
    setStoredChartPalette(store, preset.chartPalette);
};

/** `[fill, stroke]` pairs: an outline is picked against its fill, not separately. */
type ColorPair = [fill: string, stroke: string];

interface PaletteSpec {
    series: ColorPair[];
    up: ColorPair;
    down: ColorPair;
    neutral: ColorPair;
}

const toPalette = ({ series, up, down, neutral }: PaletteSpec): Palette =>
    fromSeriesColors(
        {
            ...EMPTY_PALETTE,
            up: { fill: up[0], stroke: up[1] },
            down: { fill: down[0], stroke: down[1] },
            neutral: { fill: neutral[0], stroke: neutral[1] },
        },
        series.map(([fill, stroke]) => ({ fill, stroke }))
    );

export const lightModePreset: GridPreset = {
    pageBackgroundColor: '#FAFAFA',
    params: {
        browserColorScheme: 'light',
    },
};

export const darkModePreset: GridPreset = {
    pageBackgroundColor: '#1D2634',
    params: {
        backgroundColor: '#1f2836',
        foregroundColor: '#FFF',
        browserColorScheme: 'dark',
        chromeBackgroundColor: {
            ref: 'foregroundColor',
            mix: 0.07,
            onto: 'backgroundColor',
        },
    },
    chartPalette: getChartThemePalette('ag-default-dark'),
};

export const allPresets: GridPreset[] = [
    lightModePreset,
    darkModePreset,
    {
        pageBackgroundColor: '#182323',
        params: {
            fontFamily: { googleFont: 'IBM Plex Mono' },
            fontSize: 12,
            backgroundColor: '#21222C',
            foregroundColor: '#68FF8E',
            browserColorScheme: 'dark',
            accentColor: '#68FF8E',
            borderColor: '#429356',
            spacing: 4,
            wrapperBorderRadius: 0,
            borderRadius: 0,
            headerBackgroundColor: '#21222C',
            headerTextColor: '#68FF8E',
            headerFontWeight: 700,
            headerHeight: 30,
            rowHeight: 28,
            headerVerticalPaddingScale: 1.5,
            cellTextColor: '#50F178',
            oddRowBackgroundColor: '#21222C',
            rowVerticalPaddingScale: 1.5,
            cellHorizontalPaddingScale: 0.8,
            wrapperBorder: true,
            rowBorder: true,
            columnBorder: true,
            sidePanelBorder: true,

            rangeSelectionBorderColor: 'yellow',
            rangeSelectionBorderStyle: 'dashed',
            rangeSelectionBackgroundColor: '#FFFF0020',
        },
        chartPalette: toPalette({
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
        pageBackgroundColor: '#F6F8F9',
        params: {
            fontFamily: { googleFont: 'Inter' },
            fontSize: 13,
            backgroundColor: '#FFFFFF',
            foregroundColor: '#555B62',
            accentColor: '#4E06B9',
            browserColorScheme: 'light',
            borderColor: '#D7E2E6',
            chromeBackgroundColor: {
                ref: 'backgroundColor',
            },
            spacing: 6,
            wrapperBorderRadius: 2,
            borderRadius: 2,
            headerBackgroundColor: '#FFFFFF',
            headerTextColor: '#84868B',
            headerFontSize: 13,
            headerFontWeight: 400,
            rowVerticalPaddingScale: 0.8,
            cellHorizontalPaddingScale: 0.7,
            wrapperBorder: false,
            rowBorder: true,
            columnBorder: false,
            sidePanelBorder: true,
        },
        chartPalette: toPalette({
            series: [
                ['#4E06B9', '#3A048A'],
                ['#0EA5A4', '#0B7C7B'],
                ['#F59E0B', '#C27C08'],
                ['#E5487D', '#B8335F'],
                ['#3B82F6', '#2563EB'],
                ['#8B5CF6', '#6D3FD6'],
                ['#22A06B', '#1A7A51'],
                ['#8A8F98', '#5F646C'],
            ],
            up: ['#22A06B', '#1A7A51'],
            down: ['#E5487D', '#B8335F'],
            neutral: ['#8A8F98', '#5F646C'],
        }),
    },
    {
        pageBackgroundColor: '#141516',
        params: {
            fontFamily: { googleFont: 'Roboto' },
            fontSize: 16,
            backgroundColor: '#0C0C0D',
            foregroundColor: '#BBBEC9',
            browserColorScheme: 'dark',
            accentColor: '#15BDE8',
            borderColor: '#ffffff00',
            chromeBackgroundColor: {
                ref: 'backgroundColor',
            },
            spacing: 8,
            wrapperBorderRadius: 0,
            borderRadius: 20,
            headerBackgroundColor: '#182226',
            headerTextColor: '#FFFFFF',
            headerFontWeight: 500,
            headerVerticalPaddingScale: 0.9,
            rowVerticalPaddingScale: 1.2,
            cellHorizontalPaddingScale: 1,
            wrapperBorder: false,
            rowBorder: false,
            columnBorder: false,
            sidePanelBorder: false,
            iconSize: 20,
        },
        chartPalette: toPalette({
            series: [
                ['#15BDE8', '#7DDAF2'],
                ['#F5A524', '#F9C877'],
                ['#A78BFA', '#C9B8FC'],
                ['#34D399', '#85E5C2'],
                ['#F472B6', '#F8A9D2'],
                ['#FACC15', '#FCE07A'],
                ['#60A5FA', '#9DC7FC'],
                ['#9CA3AF', '#C4C8CF'],
            ],
            up: ['#34D399', '#85E5C2'],
            down: ['#F87171', '#FBA9A9'],
            neutral: ['#9CA3AF', '#C4C8CF'],
        }),
    },
    {
        pageBackgroundColor: '#ffffff',
        params: {
            backgroundColor: '#ffffff',
            browserColorScheme: 'light',
            headerBackgroundColor: '#F9FAFB',
            accentColor: '#087AD1',
            headerTextColor: '#919191',
            foregroundColor: 'rgb(46, 55, 66)',
            fontFamily: 'Arial',
            spacing: 8,
            wrapperBorderRadius: 0,
            headerFontWeight: 600,
            oddRowBackgroundColor: '#F9FAFB',
            wrapperBorder: false,
            rowBorder: false,
            columnBorder: false,
            sidePanelBorder: false,
        },
        parts: [iconSetQuartzLight],
        chartPalette: toPalette({
            series: [
                ['#087AD1', '#065C9D'],
                ['#F28C28', '#C26C16'],
                ['#2BA84A', '#1F7E37'],
                ['#D64545', '#A83333'],
                ['#7B5CC4', '#5C429A'],
                ['#14A3A3', '#0E7A7A'],
                ['#E0B000', '#AE8800'],
                ['#6B7785', '#4D5763'],
            ],
            up: ['#2BA84A', '#1F7E37'],
            down: ['#D64545', '#A83333'],
            neutral: ['#6B7785', '#4D5763'],
        }),
    },

    {
        pageBackgroundColor: '#FFEAC1',
        params: {
            fontFamily: { googleFont: 'Merriweather' },
            fontSize: 13,
            backgroundColor: '#FFDEB4',
            foregroundColor: '#593F2B',
            browserColorScheme: 'light',
            accentColor: '#B92706',
            borderColor: '#E9CBA4',
            chromeBackgroundColor: {
                ref: 'backgroundColor',
            },
            spacing: 6,
            wrapperBorderRadius: 0,
            borderRadius: '0',
            headerBackgroundColor: '#FAD0A3',
            headerTextColor: '#4C3F35',
            headerFontFamily: { googleFont: 'UnifrakturCook' },
            headerFontSize: 16,
            headerFontWeight: 600,
            headerVerticalPaddingScale: 1.6,
            rowVerticalPaddingScale: 1,
            cellHorizontalPaddingScale: 1,
            wrapperBorder: false,
            rowBorder: true,
            columnBorder: false,
            sidePanelBorder: true,
        },
        chartPalette: toPalette({
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
        pageBackgroundColor: 'rgb(75, 153, 154)',
        params: {
            fontFamily: { googleFont: 'Pixelify Sans' },
            fontSize: 15,
            backgroundColor: '#F1EDE1',
            foregroundColor: '#605E57',
            browserColorScheme: 'light',
            accentColor: '#E0C328',
            borderColor: '#98968F',
            chromeBackgroundColor: {
                ref: 'backgroundColor',
            },
            spacing: 5,
            wrapperBorderRadius: 0,
            borderRadius: 0,
            headerBackgroundColor: '#E4DAD1',
            headerTextColor: '#3C3A35',
            headerFontSize: 15,
            headerFontWeight: 700,
            rowVerticalPaddingScale: 1.2,
        },
        parts: [iconSetAlpine],
        chartPalette: toPalette({
            series: [
                ['#E0C328', '#A88F12'],
                ['#3E8E8F', '#2A6566'],
                ['#D9534F', '#A63A37'],
                ['#5B7FBF', '#3F5C92'],
                ['#8DB255', '#66843A'],
                ['#C46FA8', '#954F7E'],
                ['#E8893A', '#B56524'],
                ['#7A766B', '#57544B'],
            ],
            up: ['#8DB255', '#66843A'],
            down: ['#D9534F', '#A63A37'],
            neutral: ['#7A766B', '#57544B'],
        }),
    },
];
