import {
    AgBaseSeriesOptions,
    AgSeriesListeners,
    AgSeriesTooltip,
    AgCartesianSeriesTooltipRendererParams,
    AgTooltipRendererResult,
    AgCartesianSeriesLabelOptions,
    CssColor,
    PixelSize,
} from 'ag-charts-community';

export interface AgWaterfallSeriesFormatterParams<DatumType> {
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

export interface AgWaterfallSeriesFormat {
    fill?: CssColor;
    stroke?: CssColor;
    strokeWidth?: PixelSize;
}

export interface AgWaterfallSeriesTooltipRendererParams extends AgCartesianSeriesTooltipRendererParams {
    /** labelKey as specified on series options. */
    readonly labelKey?: string;
    /** labelName as specified on series options. */
    readonly labelName?: string;
}

export interface AgWaterfallSeriesTooltip extends AgSeriesTooltip {
    /** Function used to create the content for tooltips. */
    renderer?: (params: AgWaterfallSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
}

export interface AgWaterfallSeriesLabelOptions extends AgCartesianSeriesLabelOptions {
    /** Where to render series labels relative to the segments. */
    placement?: AgWaterfallSeriesLabelPlacement;
    /** Padding in pixels between the label and the edge of the bar. */
    padding?: PixelSize;
}

export type AgWaterfallSeriesLabelPlacement = 'start' | 'end' | 'inside';

/** Configuration for Waterfall series. */
export interface AgWaterfallSeriesOptions<DatumType = any> extends AgBaseSeriesOptions<DatumType> {
    /** Configuration for the Waterfall series. */
    type?: 'Waterfall';
    /** Configuration for the labels shown on top of data points. */
    label?: AgWaterfallSeriesLabelOptions;
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
    /** The stroke color of cells. */
    stroke?: string; // fill and strokes TODO
    /** The stroke width of cells. */
    strokeWidth?: number;
    /** The title to use for the series. Defaults to `yName` if it exists, or `yKey` if not. */
    title?: string;
    /** Function used to return formatting for individual Waterfall cells, based on the given parameters. If the current cell is highlighted, the `highlighted` property will be set to `true`; make sure to check this if you want to differentiate between the highlighted and un-highlighted states. */
    formatter?: (params: AgWaterfallSeriesFormatterParams<DatumType>) => AgWaterfallSeriesFormat;
    /** Series-specific tooltip configuration. */
    tooltip?: AgWaterfallSeriesTooltip;
    /** A map of event names to event listeners. */
    listeners?: AgSeriesListeners<DatumType>;
}
