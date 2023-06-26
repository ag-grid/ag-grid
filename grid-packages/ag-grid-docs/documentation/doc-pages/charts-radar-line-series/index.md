---
title: "Radar Series"
enterprise: true
---

**Radar** series (sometimes called a *Spider chart*) represent a dataset in a form of a line or area drawn over a radial grid.
It can be very useful when you need to compare some datasets across **multiple categories**.

## Radar Line configuration

To plot a basic Radar Line we need an array of data, where every item will have a single category value (for the angle axis) and a single numeric value (for the radius axis).

A minimal radar line series configuration will look like:

```js
series: [{
    type: 'radar-line',
    angleKey: 'subject',
    radiusKey: 'grade',
}]
```

<chart-example title='Basic Radar Line' name='basic-radar-line' type='generated' options='{ "enterprise": true }'></chart-example>

The next example demonstrates multiple radar lines with axes having a circular shape:

```js
shape: 'circle',
series: [
    {
        type: 'radar-line',
        angleKey: 'subject',
        radiusKey: `Mike's grades`,
    },
    {
        type: 'radar-line',
        angleKey: 'subject',
        radiusKey: `Tony's grades`,
    },
]
```

<chart-example title='Radar Line with Circular Axes' name='radar-line-circle-axes' type='generated' options='{ "enterprise": true }'></chart-example>

## Polar axes

Aside from controlling the shape of axes, there are many ways to modify a look of polar grid lines and labels:

```js
shape: 'circle',
series: [
    ...
],
axes: [
    { type: 'polar-angle-category', label: { ... } },
    { type: 'polar-radius-number', gridStyle: [{ ... }] },
]
```

<chart-example title='Polar Axes' name='polar-axes' type='generated' options='{ "enterprise": true }'></chart-example>

### API Reference

<!-- TODO: replace with usual api reference component -->

```ts
/** Configuration for Radar Line series. */
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

export interface AgAngleCategoryAxisOptions extends AgBaseAxisOptions {
    type: 'polar-angle-category';
    /** Configuration for the axis ticks. */
    tick?: AgAxisCategoryTickOptions;
}

export interface AgRadiusNumberAxisOptions extends AgBaseAxisOptions {
    type: 'polar-radius-number';
    /** If 'true', the range will be rounded up to ensure nice equal spacing between the ticks. */
    nice?: boolean;
    /** User override for the automatically determined min value (based on series data). */
    min?: number;
    /** User override for the automatically determined max value (based on series data). */
    max?: number;
    /** Configuration for the axis ticks. */
    tick?: AgAxisNumberTickOptions;
    /** Configuration for the title shown next to the axis. */
    title?: AgAxisCaptionOptions;
}
```