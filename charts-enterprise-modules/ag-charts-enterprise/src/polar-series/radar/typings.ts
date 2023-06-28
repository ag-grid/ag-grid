import {
    AgBaseSeriesOptions,
    AgChartLabelOptions,
    AgSeriesListeners,
    AgSeriesMarker,
    AgSeriesMarkerFormatterParams,
    AgSeriesTooltip,
    AgSeriesTooltipRendererParams,
    AgTooltipRendererResult,
    CssColor,
    Opacity,
    PixelSize,
} from 'ag-charts-community';

export interface AgBaseRadarSeriesOptions<DatumType = any> extends AgBaseSeriesOptions<DatumType> {
    type?: 'radar-line' | 'radar-area';
    /** The key to use to retrieve angle values from the data. */
    angleKey?: string;
    /** A human-readable description of the angle values. If supplied, this will be passed to the tooltip renderer as one of the parameters. */
    angleName?: string;
    /** The key to use to retrieve radius values from the data. */
    radiusKey?: string;
    /** A human-readable description of the radius values. If supplied, this will be passed to the tooltip renderer as one of the parameters. */
    radiusName?: string;

    marker?: AgRadarSeriesMarker<DatumType>;
    /** The colour of the stroke for the lines. */
    stroke?: CssColor;
    /** The width in pixels of the stroke for the lines. */
    strokeWidth?: PixelSize;
    /** The opacity of the stroke for the lines. */
    strokeOpacity?: Opacity;
    /** Defines how the line stroke is rendered. Every number in the array specifies the length in pixels of alternating dashes and gaps. For example, `[6, 3]` means dashes with a length of `6` pixels with gaps between of `3` pixels. */
    lineDash?: PixelSize[];
    /** The initial offset of the dashed line in pixels. */
    lineDashOffset?: PixelSize;
    /** Configuration for the labels shown on top of data points. */
    label?: AgRadarSeriesLabelOptions;
    /** Series-specific tooltip configuration. */
    tooltip?: AgRadarSeriesTooltip;
    /** A map of event names to event listeners. */
    listeners?: AgSeriesListeners<DatumType>;
}

export interface AgRadarSeriesTooltipRendererParams extends AgSeriesTooltipRendererParams {
    /** xKey as specified on series options. */
    readonly angleKey: string;
    /** xValue as read from series data via the xKey property. */
    readonly angleValue?: any;
    /** xName as specified on series options. */
    readonly angleName?: string;

    /** yKey as specified on series options. */
    readonly radiusKey: string;
    /** yValue as read from series data via the yKey property. */
    readonly radiusValue?: any;
    /** yName as specified on series options. */
    readonly radiusName?: string;
}

export interface AgRadarSeriesMarkerFormatterParams<DatumType> extends AgSeriesMarkerFormatterParams<DatumType> {
    angleKey: string;
    radiusKey: string;
}

export interface AgRadarSeriesMarkerFormat {
    fill?: CssColor;
    stroke?: CssColor;
    strokeWidth?: PixelSize;
    size?: PixelSize;
}

export interface AgRadarSeriesMarker<DatumType> extends AgSeriesMarker {
    /** Function used to return formatting for individual markers, based on the supplied information. If the current marker is highlighted, the `highlighted` property will be set to `true`; make sure to check this if you want to differentiate between the highlighted and un-highlighted states. */
    formatter?: AgRadarSeriesMarkerFormatter<DatumType>;
}

export type AgRadarSeriesMarkerFormatter<DatumType> = (
    params: AgRadarSeriesMarkerFormatterParams<DatumType>
) => AgRadarSeriesMarkerFormat | undefined;

export interface AgRadarSeriesLabelFormatterParams {
    /** The ID of the series. */
    readonly seriesId: string;
    /** The value of radiusKey as specified on series options. */
    readonly value: number;
}

export interface AgRadarSeriesLabelOptions extends AgChartLabelOptions {
    /** Function used to turn 'yKey' values into text to be displayed by a label. By default the values are simply stringified. */
    formatter?: (params: AgRadarSeriesLabelFormatterParams) => string;
}

export interface AgRadarSeriesTooltip extends AgSeriesTooltip {
    /** Function used to create the content for tooltips. */
    renderer?: (params: AgRadarSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
    format?: string;
}

/**
 * Internal Use Only: Used to ensure this file is treated as a module until we can use moduleDetection flag in Ts v4.7
 */
export const __FORCE_MODULE_DETECTION = 0;
