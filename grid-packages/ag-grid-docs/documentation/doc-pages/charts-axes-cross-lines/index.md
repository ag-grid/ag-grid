---
title: "Cross Lines"
---
Cross lines are lines or shaded areas in a chart that can highlight important information like trends and thresholds, making them useful for data analysis.

## Adding Cross Lines

To add a cross line at a specific data value on an axis, you need to specify the `crossLines` property on the `axis` options object:

<interface-documentation interfaceName='AgBaseCartesianAxisOptions' names='["crossLines"]' config='{"description":"", "overrideBottomMargin":"1rem", "lookupRoot": "charts-api", "suppressTypes": ["DataValue", "CssColor", "CssColor", "Opacity", "PixelSize", "FontStyle", "FontWeight", "FontSize", "FontFamily", "AgCrossLineLabelPosition"]}' ></interface-documentation>

The following snippet shows how to add a horizontal cross line:

```js
axes: [
	{
		position: 'left',
		type: 'number',
		crossLines: [
			{
				type: 'line',
				value: 11
			}
		]
	}
]
```

To create a region on a chart between two lines, set the `type` of cross line to `range`, and provide an array with the
two data values that define the region as shown below:

```js
axes: [
	{
		position: 'bottom',
		type: 'category',
		crossLines: [
			{
				type: 'range',
				range: ['Jun', 'Sep']
			}
		]
	}
]
```

The following example demonstrates these configurations:

<chart-example title='Adding Cross Lines' name='axis-cross-lines-adding' type='generated'></chart-example>

## Customising Cross Lines 

The properties such as `stroke`, `strokeWidth`, and `fill` can be customised by using `AgCrossLineOptions`. 
Additionally, a label can be added and positioned in relation to the cross line, as shown below:

```js
crossLines: [
    {
        type: 'range',
        range: [new Date(2019, 4, 1), new Date(2019, 6, 1)],
        strokeWidth: 0,
        fill: '#7290C4',
        fillOpacity: 0.4,
        label: {
            text: 'Price Peak',
            position: 'top',
            fontSize: 14,
        },
    }
]
```

The example below demonstrates these configurations, note the following:

- Data values can be numbers or categories such as `String` values or `Date` objects in accordance with values provided in the chart data.
- The left Y axis has cross lines with type `line`, so the `value` property on each cross lines options object is used to position the lines on the chart.
- The bottom X axis has a cross line of type `range`; the `range` property is used to configure the range of the cross line boundaries.

<chart-example title='Customising Cross Lines' name='axis-cross-lines-customising' type='generated'></chart-example>