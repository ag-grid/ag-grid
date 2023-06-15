---
title: "Waterfall Series"
enterprise: true
---

Waterfall series show how positive and negative data values accumulate, using bars that rise or fall, resembling a cascading waterfall.

## Waterfall Column

To create a basic waterfall column chart, use the `waterfall-column` series type and specify the `xKey` and `yKey` properties:

```js
series: [{
    type: 'waterfall-column',
    xKey: 'date',
    yKey: 'amount',
}]
```

<chart-example title='Basic Waterfall Column' name='basic-waterfall-column' type='generated' options='{ "enterprise": true }'></chart-example>


## Waterfall Bar

To create a basic waterfall bar chart, use the `waterfall-bar` series type and specify the `xKey` and `yKey` properties:

```js
series: [{
    type: 'waterfall-bar',
    xKey: 'date',
    yKey: 'amount',
}]
```

<chart-example title='Basic Waterfall Bar' name='basic-waterfall-bar' type='generated' options='{ "enterprise": true }'></chart-example>

### API Reference

<!-- TODO: replace with usual api reference component -->

```ts
/** Configuration for waterfall series. */
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
    type?: 'waterfall-bar' | 'waterfall-column';
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
    /** The key to use to retrieve values from the data to use as labels for the bars. */
    labelKey?: string;
    /** A human-readable description of the label values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    labelName?: string;
    /** Configuration for the negative series items. */
    negativeItem?: AgWaterfallSeriesItemOptions;
    /** Configuration for the positive series items. */
    positiveItem?: AgWaterfallSeriesItemOptions;
    /** Configuration for the connector lines. */
    line?: AgWaterfallSeriesLineOptions;
    /** Configuration for the shadow used behind the chart series. */
    shadow?: AgDropShadowOptions;
    /** The title to use for the series. Defaults to `yName` if it exists, or `yKey` if not. */
    title?: string;
    /** Function used to return formatting for individual Waterfall cells, based on the given parameters. If the current cell is highlighted, the `highlighted` property will be set to `true`; make sure to check this if you want to differentiate between the highlighted and un-highlighted states. */
    formatter?: (params: AgWaterfallSeriesFormatterParams<DatumType>) => AgWaterfallSeriesFormat;
    /** Series-specific tooltip configuration. */
    tooltip?: AgWaterfallSeriesTooltip;
    /** A map of event names to event listeners. */
    listeners?: AgSeriesListeners<DatumType>;
}

export interface AgWaterfallSeriesItemOptions {
    /** A human-readable description of the y-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    name?: string;
    /** The fill colour to use for the bars. */
    fill?: CssColor;
    /** Opacity of the bars. */
    fillOpacity?: Opacity;
    /** The colour to use for the bars. */
    stroke?: CssColor;
    /** The width in pixels of the bars. */
    strokeWidth?: PixelSize;
    /** Opacity of the bars. */
    strokeOpacity?: Opacity;
    /** Defines how the strokes are rendered. Every number in the array specifies the length in pixels of alternating dashes and gaps. For example, `[6, 3]` means dashes with a length of `6` pixels with gaps between of `3` pixels. */
    lineDash?: PixelSize[];
    /** The initial offset of the dashed line in pixels. */
    lineDashOffset?: PixelSize;
}

export interface AgWaterfallSeriesLineOptions {
    /** The colour to use for the connector lines. */
    stroke?: CssColor;
    /** The width in pixels of the connector lines. */
    strokeWidth?: PixelSize;
    /** Opacity of the line stroke. */
    strokeOpacity?: Opacity;
    /** Defines how the strokes are rendered. Every number in the array specifies the length in pixels of alternating dashes and gaps. For example, `[6, 3]` means dashes with a length of `6` pixels with gaps between of `3` pixels. */
    lineDash?: PixelSize[];
    /** The initial offset of the dashed line in pixels. */
    lineDashOffset?: PixelSize;
}