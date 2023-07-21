---
title: "Radar Series"
enterprise: true
---

**Radar** series (sometimes called a *Spider chart*) represent a dataset in a form of a line or area drawn over a radial grid.
It can be very useful when you need to compare some datasets across **multiple categories**.

## Radar Line

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

## Radar Area

Radar Areas are very similar to Radar Lines. The next example demonstrates multiple radar area series on the same chart:

```js
series: [
    {
        type: 'radar-area',
        angleKey: 'subject',
        radiusKey: `Mike's grades`,
    },
    {
        type: 'radar-area',
        angleKey: 'subject',
        radiusKey: `Tony's grades`,
    },
],
```

<chart-example title='Basic Radar Area' name='basic-radar-area' type='generated' options='{ "enterprise": true }'></chart-example>

## Polar axes

There are many ways to modify a look of polar grid lines and labels. For example it's possible to change the shape of axes from polygons to circles:

```js
series: [
    ...
],
axes: [
    { type: 'angle-category', shape: 'circle' },
    { type: 'radius-number', shape: 'circle' },
]
```

<chart-example title='Polar Axes' name='polar-axes' type='generated' options='{ "enterprise": true }'></chart-example>

Please see the API reference for more polar axes style options.

### API Reference

<!-- TODO: replace with usual api reference component -->

```ts
/** Configuration for Radar Line series. */
export interface AgRadarLineSeriesOptions<DatumType = any> extends AgBaseRadarSeriesOptions<DatumType> {
    type?: 'radar-line';
}

/** Configuration for Radar Area series. */
export interface AgRadarAreaSeriesOptions<DatumType = any> extends AgBaseRadarSeriesOptions<DatumType> {
    type?: 'radar-area';
    /** The colour to use for the fill of the area. */
    fill?: CssColor;
    /** The opacity of the fill for the area. */
    fillOpacity?: Opacity;
}

/** Configuration for Radar series. */
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

export interface AgAngleCategoryAxisOptions extends AgBaseAxisOptions {
    type: 'angle-category';
    /** Configuration for the axis ticks. */
    tick?: AgAxisCategoryTickOptions;
    /** Shape of axis. Default: `polygon` */
    shape?: 'polygon' | 'circle';
}

export interface AgRadiusNumberAxisOptions extends AgBaseAxisOptions {
    type: 'radius-number';
    /** If 'true', the range will be rounded up to ensure nice equal spacing between the ticks. */
    nice?: boolean;
    /** User override for the automatically determined min value (based on series data). */
    min?: number;
    /** User override for the automatically determined max value (based on series data). */
    max?: number;
    /** Configuration for the axis ticks. */
    tick?: AgAxisNumberTickOptions;
    /** Shape of axis. Default: `polygon` */
    shape?: 'polygon' | 'circle';
    /** Configuration for the title shown next to the axis. */
    title?: AgAxisCaptionOptions;
}
```
