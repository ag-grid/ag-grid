import type { ChartAxis } from '../chart/chartAxis';
import type { ChartLegend, ChartLegendType } from '../chart/legendDatum';
import type { Series } from '../chart/series/series';
import type { AgBaseChartThemeOverrides, AgChartOptions, AgChartThemePalette } from '../options/agChartOptions';
import type { BaseModule, ModuleInstance } from './baseModule';
import type { ModuleContext } from './moduleContext';
export type AxisConstructor = new (moduleContext: ModuleContext) => ChartAxis;
export type SeriesConstructor = new (moduleContext: ModuleContext) => Series<any>;
export type LegendConstructor = new (moduleContext: ModuleContext) => ChartLegend;
export type SeriesPaletteOptions<SeriesType extends RequiredSeriesType, SeriesOpts = NonNullable<AgChartOptions['series']>[number] & {
    type: SeriesType;
}, ColourKeys = 'stroke' | 'fill' | 'fills' | 'strokes' | 'colors', NestedKeys = 'marker' | 'calloutLine'> = {
    [K in keyof SeriesOpts & ColourKeys]: NonNullable<SeriesOpts[K]>;
} & {
    [K in keyof SeriesOpts & NestedKeys]: {
        [K2 in keyof NonNullable<SeriesOpts[K]> & ColourKeys]: NonNullable<NonNullable<SeriesOpts[K]>[K2]>;
    };
};
export interface SeriesPaletteFactoryParams {
    takeColors: (count: number) => {
        fills: string[];
        strokes: string[];
    };
    colorsCount: number;
    userPalette: AgChartThemePalette | null;
    themeTemplateParameters: {
        extensions: Map<string, any>;
        properties: Map<string, string | string[]>;
    };
}
export type SeriesPaletteFactory<SeriesType extends RequiredSeriesType = RequiredSeriesType> = (params: SeriesPaletteFactoryParams) => SeriesPaletteOptions<SeriesType>;
export interface RootModule<M extends ModuleInstance = ModuleInstance> extends BaseModule {
    type: 'root';
    instanceConstructor: new (ctx: ModuleContext) => M;
    themeTemplate?: {};
    conflicts?: Array<keyof AgChartOptions>;
}
export interface AxisModule extends BaseModule {
    type: 'axis';
    identifier: string;
    instanceConstructor: AxisConstructor;
    themeTemplate: {};
}
export interface LegendModule extends BaseModule {
    type: 'legend';
    identifier: ChartLegendType;
    instanceConstructor: LegendConstructor;
    themeTemplate?: {};
}
type SeriesOptionsTypes = NonNullable<AgChartOptions['series']>[number];
type RequiredSeriesType = NonNullable<SeriesOptionsTypes['type']>;
type Extensible<T> = {
    [K in keyof T]?: NonNullable<T[K]> extends object ? Extensible<T[K]> : T[K];
} & {
    __extends__?: string;
};
type SeriesTheme<SeriesType extends RequiredSeriesType> = NonNullable<AgBaseChartThemeOverrides[SeriesType]>['series'];
export type ExtensibleTheme<SeriesType extends RequiredSeriesType> = Extensible<SeriesTheme<SeriesType>>;
export type ExtensibleDefaults<SeriesType extends RequiredSeriesType, ChartOptions = AgChartOptions & {
    series?: {
        type: SeriesType;
    };
}> = Extensible<ChartOptions>;
export type SeriesOptions<SeriesType extends RequiredSeriesType> = Extract<SeriesOptionsTypes, {
    type: SeriesType;
}>;
export interface SeriesModule<SeriesType extends RequiredSeriesType = RequiredSeriesType> extends BaseModule {
    type: 'series';
    identifier: SeriesType;
    instanceConstructor: SeriesConstructor;
    seriesDefaults: ExtensibleDefaults<SeriesType>;
    themeTemplate: ExtensibleTheme<SeriesType>;
    enterpriseThemeTemplate?: ExtensibleTheme<SeriesType>;
    paletteFactory?: SeriesPaletteFactory<SeriesType>;
    solo?: boolean;
    stackable?: boolean;
    groupable?: boolean;
    stackedByDefault?: boolean;
    swapDefaultAxesCondition?: (opts: SeriesOptions<SeriesType>) => boolean;
    customDefaultsFunction?: (opts: SeriesOptions<SeriesType>) => AgChartOptions;
}
export {};
