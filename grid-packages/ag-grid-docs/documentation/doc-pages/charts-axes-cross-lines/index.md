---
title: "Axis Cross Lines"
---

This section covers axis cross lines

## Cross Lines

Cross lines display a vertical or horizontal line or region running across a desired chart region. This feature can be useful for data analysis as the cross lines or shaded regions will emphasise trends and draw attention to important information such as a threshold. Cross lines are not supported on polar (pie, doughnut) or treemap charts.

To render a cross line at a specific data value associated with a particular axis, the `crossLines` property needs to be specified on the individual `axes` options objects. The cross lines will span the entire chart width or height depending on which axis they are configured on.

```js
axes: [
	{
		position: 'bottom',
		type: 'number',
		crossLines: [
			// an Array of cross lines to be displayed at specific values at the bottom axis.
			{
				type: 'line',
				value: 20
			}
		]
	}
]
```

The snippet above will render a vertical line running across the height of the chart at the data value `20` on the bottom axis.

To display a region bound by two lines, the cross line `type` can be configured to `range` and the `range` property set to an array containing two data values corresponding to the boundaries of the cross line region:

```js
axes: [
	{
		position: 'right',
		type: 'number',
		crossLines: [
			// an Array of cross lines to be displayed at specific values at the right axis.
			{
				type: 'range',
				range: [10, 20]
			}
		]
	}
]
```

The snippet above will mark a horizontal region between the values `10` and `20`, running across the width of the chart.

Cross lines styles such as `stroke`, `strokeWidth` and `fill` are customisable via `AgCrossLineOptions`. A `label` can also be added and positioned with respect to the cross line.

```js
crossLines: [
  {
    type: 'range',
    range: ['apple', 'orange'],
    label: {
      text: 'Price Peak',
      position: 'top',
      fontSize: 14,
      // other cross line label options...
    },
    strokeWidth: 0,
    fill: '#7290C4',
    fillOpacity: 0.4,
  },
],
```

Please see the [API reference](#reference-AgBaseCartesianAxisOptions-crossLines) for the full cross lines styling options.

### Example: Cross Lines

The example below demonstrates how one or more cross lines can be configured in each axis direction. Note that:

- Data values can be numbers or categories such as string values or Date objects in accordance with values provided in the chart data.
- The left Y axis has cross lines with type `line`, so the `value` property on each cross lines options object is used to position the lines on the chart.
- The bottom X axis has a cross line of type `range`; the `range` property is used to configure the range of the cross line boundaries.

<chart-example title='Cross Lines' name='axis-cross-lines' type='generated'></chart-example>

## Next Up

Continue to the next section to learn more about [overlays](/charts-overlays/).