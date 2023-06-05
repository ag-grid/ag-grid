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

export interface AgRadarLineSeriesTooltipRendererParams extends AgSeriesTooltipRendererParams {
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

export interface AgRadarLineSeriesMarkerFormatterParams<DatumType> extends AgSeriesMarkerFormatterParams<DatumType> {
    angleKey: string;
    radiusKey: string;
}

export interface AgRadarLineSeriesMarkerFormat {
    fill?: CssColor;
    stroke?: CssColor;
    strokeWidth?: PixelSize;
    size?: PixelSize;
}

export interface AgRadarLineSeriesMarker<DatumType> extends AgSeriesMarker {
    /** Function used to return formatting for individual markers, based on the supplied information. If the current marker is highlighted, the `highlighted` property will be set to `true`; make sure to check this if you want to differentiate between the highlighted and un-highlighted states. */
    formatter?: AgRadarLineSeriesMarkerFormatter<DatumType>;
}

export type AgRadarLineSeriesMarkerFormatter<DatumType> = (
    params: AgRadarLineSeriesMarkerFormatterParams<DatumType>
) => AgRadarLineSeriesMarkerFormat | undefined;

export interface AgRadarLineSeriesLabelFormatterParams {
    /** The ID of the series. */
    readonly seriesId: string;
    /** The value of radiusKey as specified on series options. */
    readonly value: number;
}

export interface AgRadarLineSeriesLabelOptions extends AgChartLabelOptions {
    /** Function used to turn 'yKey' values into text to be displayed by a label. By default the values are simply stringified. */
    formatter?: (params: AgRadarLineSeriesLabelFormatterParams) => string;
}

export interface AgRadarLineSeriesTooltip extends AgSeriesTooltip {
    /** Function used to create the content for tooltips. */
    renderer?: (params: AgRadarLineSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
    format?: string;
}

export interface AgRadarLineSeriesOptions<DatumType = any> extends AgBaseSeriesOptions<DatumType> {
    type?: 'radar-line';
    /** The key to use to retrieve angle values from the data. */
    angleKey?: string;
    /** A human-readable description of the angle values. If supplied, this will be passed to the tooltip renderer as one of the parameters. */
    angleName?: string;
    /** The key to use to retrieve radius values from the data. */
    radiusKey?: string;
    /** A human-readable description of the radius values. If supplied, this will be passed to the tooltip renderer as one of the parameters. */
    radiusName?: string;

    marker?: AgRadarLineSeriesMarker<DatumType>;
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
    label?: AgRadarLineSeriesLabelOptions;
    /** Series-specific tooltip configuration. */
    tooltip?: AgRadarLineSeriesTooltip;
    /** A map of event names to event listeners. */
    listeners?: AgSeriesListeners<DatumType>;
}

/**
 * Internal Use Only: Used to ensure this file is treated as a module until we can use moduleDetection flag in Ts v4.7
 */
export const __FORCE_MODULE_DETECTION = 0;
