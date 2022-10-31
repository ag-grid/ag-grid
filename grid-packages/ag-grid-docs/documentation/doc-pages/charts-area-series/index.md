---
title: "Area Series"
---

Area series are line series with the area under the line filled, placing more emphasis on the magnitude of the change. Area series additionally support stacking to show the total value and the way individual values relate to the whole.

## Single Area Series

To create a simple area chart we need to use series type `'area'`. We also have to provide the `xKey` and `yKey` properties. A minimal `'area'` series config would therefore look like this:

```js
series: [{
    type: 'area',
    xKey: 'year',
    yKey: 'ie',
}]
```

In the snippet above we are using `'ie'` as the `yKey` to show market share of this internet browser. Using this simple series config produces the following chart:

<chart-example title='Single Area Series' name='single-area' type='generated'></chart-example>

[[note]]
| Even though area series support markers, they are turned off by default for this series type, as this stylisation is the most common.

To enable area markers, all we need to do is add this to the series config:

```js
series: [{
    ...
    marker: {
        enabled: true
    }
}]
```

Tooltips will be shown on hover, which in this case show percentage values without a `%` suffix.

The series are designed to work with all kinds of data and are unaware of the nature of the values. So we additionally provide a `tooltipRenderer` to add the `%` suffix. After this change, the tooltips will change like so:

<div style="display: flex; justify-content: center;">
    <image-caption src="default-area-tooltip.png" alt="Default Area Tooltip" width="256px" constrained="true">Before</image-caption>
    <div style="margin: auto 0;">--></div>
    <image-caption src="custom-area-tooltip.png" alt="Custom Area Tooltip" width="256px" constrained="true">After</image-caption>
</div>

The final result can be seen in the example below.

<chart-example title='Single Area Series with Markers' name='single-area-markers' type='generated'></chart-example>

Showing labels on top of data points is also an option with the `label` config. Labels can be enabled independently of series markers.
For example, to show bold labels on top of each data point (and in this case a marker) we would use the following config:

```js
series: [{
    ...
    label: {
        fontWeight: 'bold'
    }
}]
```

The above config is used in the example below. Feel free to open it in Pluker and experiment with other [label options](#reference-AgAreaSeriesOptions-label).

<chart-example title='Single Area Series with Markers and Labels' name='single-area-markers-labels' type='generated'></chart-example>

## Multiple Area Series

It is possible to use more than one `'area'` series in a single chart. For example, if we want one series to show the magnitude of change in market share of Internet Explorer and the other series the change in market share of Chrome, we could use the following `series` config:

```js
series: [
    {
        type: 'area',
        xKey: 'year',
        yKey: 'ie'
    },
    {
        type: 'area',
        xKey: 'year',
        yKey: 'chrome'
    }
]
```

[[note]]
| Since multiple area series can overlap, it is a good idea to make the fill translucent, for example using `fillOpacity: 0.7`.

Note that in the example below we also:

- Use `yName` to control the text that the legend displays
- Enable `marker`s
- Define custom `fill` and `stroke`
- Make the fill translucent using the `fillOpacity` config

<chart-example title='Multiple Area Series' name='multi-area' type='generated'></chart-example>

## Stacked Area Series

The `stacked: true` property controls series stacking behaviour. For example, to have a stacked area chart that shows changes in market share for the most popular internet browsers we could use a config like this:

```js
series: [
    { type: 'area', xKey: 'year', yKey: 'ie', stacked: true },
    { type: 'area', xKey: 'year', yKey: 'firefox', stacked: true },
    { type: 'area', xKey: 'year', yKey: 'safari', stacked: true },
    { type: 'area', xKey: 'year', yKey: 'chrome', stacked: true }
]
```

This produces the following chart:

<chart-example title='Stacked Area Series' name='stacked-area' type='generated'></chart-example>

## Normalized Area Series

Following on from our [stacked area series](#example-stacked-area-series) example, if we want to normalize the totals so that for any given year stack levels always added up to a certain value, for example 100%, we could add the following to our series config:

```js
normalizedTo: 100
```

[[note]]
| It's possible to use any non-zero value to normalize to.

<chart-example title='Normalized Stacked Area Series' name='normalized-area' type='generated'></chart-example>

## Missing Data

Sometimes data for certain items or time periods might be missing.

The chart handles such cases based on whether the `xKey`  or `yKey` value of a data point is invalid.

The `yKey` value of a data point is invalid if it’s `+/-Infinity`, `null`, `undefined` or `NaN`. A data point with an invalid `yKey` value will be rendered as a gap in the series.

The `xKey` value of a data point is invalid if it’s a number, object, `+/-Infinity`, `null`, `undefined` or `NaN`. The chart handles this depending on the X-axis type:

- For continuous X axes (either a `'time'` or `'number'` axis), the data point will be skipped altogether.
- For category X axes the data point will not be skipped. It will be rendered as a category along the X axis.

The following example demonstrates how missing data is handled for a continuous X-axis type (time axis) in Area Series:

- Initially there is no missing data, all values are valid for their associated axes.
- Click the Missing Y values button and note that missing Y values are rendered as gaps in the area chart.
- Click the Missing Y values button and note that missing X values causes no data point to be displayed (hence fewer data points shown in the area chart).
- The second row of buttons allow switching between stacked and grouped area series.

<chart-example title='Area Series with Incomplete Data' name='missing-data-area' type='generated'></chart-example>


## API Reference

<interface-documentation interfaceName='AgAreaSeriesOptions' overridesrc="charts-api/api.json" config='{ "showSnippets": false }'></interface-documentation>

## Next Up

Continue to the next section to learn about [scatter and bubble series](/charts-scatter-series/).
