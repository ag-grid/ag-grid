import {
    AgBaseSeriesOptions,
    AgSeriesListeners,
    AgSeriesTooltip,
    AgCartesianSeriesTooltipRendererParams,
    AgTooltipRendererResult,
    CssColor,
    PixelSize,
} from 'ag-charts-community';

export { HeatmapModule } from './heatmapModule';

export interface AgHeatmapSeriesFormatterParams<DatumType> {
    readonly datum: DatumType;
    readonly fill?: CssColor;
    readonly stroke?: CssColor;
    readonly strokeWidth: PixelSize;
    readonly highlighted: boolean;
    readonly xKey: string;
    readonly yKey: string;
    readonly colorKey?: string;
    readonly labelKey?: string;
    readonly seriesId: string;
}

export interface AgHeatmapSeriesFormat {
    fill?: CssColor;
    stroke?: CssColor;
    strokeWidth?: PixelSize;
}

export interface AgHeatmapSeriesTooltipRendererParams extends AgCartesianSeriesTooltipRendererParams {
    /** labelKey as specified on series options. */
    readonly labelKey?: string;
    /** labelName as specified on series options. */
    readonly labelName?: string;
}

export interface AgHeatmapSeriesTooltip extends AgSeriesTooltip {
    /** Function used to create the content for tooltips. */
    renderer?: (params: AgHeatmapSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
}

export interface AgHeatmapSeriesLabelOptions extends AgTooltipRendererResult {}

/** Configuration for heatmap series. */
export interface AgHeatmapSeriesOptions<DatumType = any> extends AgBaseSeriesOptions<DatumType> {
    /** Configuration for the heatmap series. */
    type?: 'heatmap';
    /** Configuration for the labels shown on top of data points. */
    label?: AgHeatmapSeriesLabelOptions;
    /** The key to use to retrieve x-values from the data. */
    xKey?: string;
    /** The key to use to retrieve y-values from the data. */
    yKey?: string;
    /** A human-readable description of the x-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    xName?: string;
    /** A human-readable description of the y-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    yName?: string;
    /** The key to use to retrieve values from the data to use as labels for the markers. */
    labelKey?: string;
    /** A human-readable description of the label values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    labelName?: string;
    /** The name of the node key containing the color value. This value (along with `colorDomain` and `colorRange` configs) will be used to determine the tile color. */
    colorKey?: string;
    /** A human-readable description of the colour values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    colorName?: string;
    /** The domain the 'colorKey' values belong to. The domain can contain more than two stops, for example `[-5, 0, -5]`. In that case the 'colorRange' should also use a matching number of colors. */
    colorDomain?: number[];
    /** The color range to interpolate the numeric `colorDomain` into. For example, if the `colorDomain` is `[-5, 5]` and `colorRange` is `['red', 'green']`, a `colorKey` value of `-5` will be assigned the 'red' color, `5` - 'green' color and `0` a blend of 'red' and 'green'. */
    colorRange?: string[];
    /** The stroke color of cells. */
    stroke?: string;
    /** The stroke width of cells. */
    strokeWidth?: number;
    /** The title to use for the series. Defaults to `yName` if it exists, or `yKey` if not. */
    title?: string;
    /** Function used to return formatting for individual heatmap cells, based on the given parameters. If the current cell is highlighted, the `highlighted` property will be set to `true`; make sure to check this if you want to differentiate between the highlighted and un-highlighted states. */
    formatter?: (params: AgHeatmapSeriesFormatterParams<DatumType>) => AgHeatmapSeriesFormat;
    /** Series-specific tooltip configuration. */
    tooltip?: AgHeatmapSeriesTooltip;
    /** A map of event names to event listeners. */
    listeners?: AgSeriesListeners<DatumType>;
}
