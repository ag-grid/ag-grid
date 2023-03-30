---
title: "Pie and Doughnut Series"
---

Pie series are useful for illustrating the numerical proportion of data values. The sectors in a pie series show the contribution of individual values to the whole.

For example, a pie series could be used to visualise the market share of each competitor as a proportion of the total.

## Basic Configuration

To plot a basic pie all we need is an array of values that will determine the angle of each pie sector. The total of all values will correspond to the full pie.

A minimal pie series configuration is shown below:

```js
series: [
  {
    type: "pie",
    angleKey: "value",
  },
]
```

This results in the chart shown below. Note that [tooltips](/charts-tooltips/) show the absolute value of each pie sector.

<chart-example title='Basic Pie Chart' name='basic-pie' type='generated'></chart-example>

## Labels

We support two types of label related to individual sectors:

- Call-out labels: displayed adjacent to each sector with a joining line (configured via `calloutLabelKey`, `calloutLabel` and `calloutLabelLine` options).
- Sector labels: displayed inside each sector (configured via `sectorLabelKey` and `sectorLabel` options).

Additionally legend labels and tooltips are derived from the call-out label options.

```diff
series: [{
    type: 'pie',
    angleKey: 'value',

+   calloutLabelKey: 'label',
+   legendItemKey: 'label',
+   sectorLabelKey: 'value',
+   sectorLabel: {
+       color: 'white',
+       fontWeight: 'bold'
+   }
}]
```

This example demonstrates:

- Use of `calloutLabelKey`, enabling:
  - Display of a per-sector callout label.
  - Tooltips on segment hover including the callout label and sector value.
  - Some callout labels are not displayed, where the sector is smaller than `calloutLabel.minAngle` (defaults to `20`).
- Use of `legendItemKey`, enabling:
  - Labels for use in the legend.
- Use of `sectorLabelKey` and `sectorLabel`, enabling:
  - Display of a per-sector inside label.
  - Some sector labels are not displayed, where the sector is too small to fit the label text.
- Individual sectors can be toggled on and off via the legend.

<chart-example title='Pie Chart with Labels' name='pie-labels' type='generated'></chart-example>

The `calloutLabel.formatter` and `sectorLabel.formatter` functions can be used to change the text value displayed in the labels. They receive a single object as a parameter containing values associated with a pie sector. Please see the [API reference](#api-reference) for the full list of available properties.

For example, to display the numeric values for a given pie sector in the callout label,
you can use the following label formatter function:

```js
series: [{
    ...
    calloutLabel: {
        formatter: ({ datum, calloutLabelKey, angleKey }) => {
            return `${datum[calloutLabelKey]}: ${datum[angleKey]}`;
        }
    }
}]
```

Please check the [API reference](#api-reference) below to learn more about `calloutLabel`, `calloutLine` and `sectorLabel`, as well as other series configuration.

## Variable Sector Radius

Let's say we have the data for both the market share of mobile operating systems and the level of user satisfaction with each OS. We could represent the satisfaction level as the radius of a sector using the `radiusKey` config like so:

```js
series: [
  {
    type: "pie",
    calloutLabelKey: "os",
    angleKey: "share",
    radiusKey: "satisfaction",
  },
]
```

A pie chart where sectors have different radii is also known as a **rose chart**.

<chart-example title='Sectors with Different Radii' name='sector-radius' type='generated'></chart-example>

## Doughnuts

Pie series can be used to create a doughnut chart by using the `innerRadiusOffset` config.

```js
series: [
  {
    type: "pie",
    calloutLabelKey: "os",
    angleKey: "share",
    innerRadiusOffset: -70,
  },
]
```

The config specifies the offset value from the maximum pie radius which all pie sectors use by default (the maximum pie series radius is determined automatically by the chart depending on the chart's dimensions). `-70` in the snippet above means the inner radius of the series should be 70 pixels smaller than the maximum radius.

<chart-example title='Doughnut Chart' name='doughnut-chart' type='generated'></chart-example>

Alternatively a doughnut chart can be created by using the `innerRadiusRatio` property. A value between `0.0` and `1.0` should be assigned:

```diff
series: [{
    type: 'pie',
    labelKey: 'os',
    angleKey: 'share',
+   innerRadiusRatio: 0.75,
}]
```

### Additional Doughnut Labels

The `innerLabels` property can be used to put several text lines inside a doughnut chart.
The colour of the doughnut's centre can be changed by using `innerCircle`.

```js
series: [{
    ...
    innerLabels: [
        { text: '85%', fontSize: 48, color: 'green' },
        { text: 'Coverage', margin: 4 }
    ],
    innerCircle: {
        fill: 'lightgreen',
    }
}]
```

<chart-example title='Text Inside a Doughnut Chart' name='text-inside-doughnut' type='generated'></chart-example>

### Multiple Doughnuts

As well as the `innerRadiusOffset` or `innerRadiusRatio` we can also configure the `outerRadiusOffset` or `outerRadiusRatio`.
This gives us the ability to render multiple pie series in a single chart without overlapping.

```js
series: [
    {
        type: 'pie',
        outerRadiusRatio: 1,   // 100% (default)
        innerRadiusRatio: 0.8, // 80%
        ...
    },
    {
        type: 'pie',
        outerRadiusRatio: 0.5, // 50%
        innerRadiusRatio: 0.3, // 30%
        ...
    }
]
```

In the snippet above we configure the `outerRadiusRatio` of the second (inner) series to be smaller than the `innerRadiusRatio` of the first (outer) series.
The difference of `0.3` (`30%`) between these offsets will determine the size of the gap between the outer and inner series. The difference between `outerRadiusRatio` and `innerRadiusRatio` for each series will determine the thickness of the rings, which will be `20%` of the total radius for both series in this case.

The example below uses one pie series to plot the market share of each operating system and another pie series to plot user satisfaction level with each OS:

<chart-example title='Multi-Doughnut Chart' name='multi-doughnut' type='generated'></chart-example>

In the example below, the same `legendItemKey` has been provided for both series. When a legend item is clicked the items in all series that having matching `legendItemKey` values will be toggled together.

<chart-example title='Multi-Doughnut Chart with Shared Series' name='multi-doughnut-shared' type='generated'></chart-example>

## API Reference

<interface-documentation interfaceName='AgPieSeriesOptions' overridesrc="charts-api/api.json" config='{ "showSnippets": false, "lookupRoot": "charts-api" }'></interface-documentation>

## Next Up

Continue to the next section to learn about [treemap](../treemap-series/).
