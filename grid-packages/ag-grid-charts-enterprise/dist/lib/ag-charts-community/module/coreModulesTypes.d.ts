import type { SeriesOptionsTypes } from '../chart/mapping/types';
import type { AgChartOptions } from '../options/agChartOptions';
type RequiredSeriesType = NonNullable<SeriesOptionsTypes['type']>;
export interface SeriesPaletteFactoryParams {
    takeColors: (count: number) => {
        fills: string[];
        strokes: string[];
    };
    colorsCount: number;
    userPalette: boolean;
    themeTemplateParameters: {
        extensions: Map<string, any>;
        properties: Map<string, string | string[]>;
    };
}
export type SeriesPaletteFactory<SeriesType extends RequiredSeriesType = RequiredSeriesType> = (params: SeriesPaletteFactoryParams) => SeriesPaletteOptions<SeriesType>;
export type SeriesPaletteOptions<SeriesType extends RequiredSeriesType, SeriesOpts = NonNullable<AgChartOptions['series']>[number] & {
    type: SeriesType;
}, ColourKeys = 'stroke' | 'fill' | 'fills' | 'strokes' | 'colors', NestedKeys = 'marker' | 'calloutLine'> = {
    [K in keyof SeriesOpts & ColourKeys]: NonNullable<SeriesOpts[K]>;
} & {
    [K in keyof SeriesOpts & NestedKeys]: {
        [K2 in keyof NonNullable<SeriesOpts[K]> & ColourKeys]: NonNullable<NonNullable<SeriesOpts[K]>[K2]>;
    };
};
export {};
