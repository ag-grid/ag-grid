---
title: "Sparklines - Points of Interest"
enterprise: true
---

This section covers Sparkline Points of Interest.

In the line and area sparklines, each data point is represented by a marker. In the column sparkline, each data point is represented by a rectangle.
Some of these data points in the sparklines are special and can be emphasised to make comparisons easier across multiple sparklines of the same type.

Special points include:
- First
- Last
- Maximum
- Minimum
- Positive
- Negative

These points can be customised via the formatter callback function to make them stand out from the rest of the normal data points which have global styles.

- The formatter is a callback function used to return formatting for individual data points based on the given parameters.
- It will receive an input according to the sparkline type.
- All formatters will receive the highlighted property in the input.
- If the current data point is highlighted, the highlighted property will be set to true; make sure to check this if you want to differentiate between the highlighted and un-highlighted states when customising the special points.

## Line and Area Sparklines Points of Interest

For the line and area sparklines, the formatter callback function will receive an input of type `markerFormatterParams`.

``` ts
interface MarkerFormatterParams {
    datum: any;
    xValue: any; // x value of the marker
    yValue: any; // y value of the marker
    min? : boolean; // whether or not the marker is a minimum point
    max?: boolean; // whether or not the marker is a maximum point
    first?: boolean; // whether or not the marker represents the first data point
    last?: boolean; // whether or not the marker represents the last data point
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    size: number;
    highlighted: boolean; // whether or not the marker is highlighted
}
```
The marker attributes which this formatter allows to customise are:
 - enabled
 - size
 - fill
 - stroke
 - strokeWidth

The function return type should be `MarkerFormat`.

```ts
export interface MarkerFormat {
    enabled?: boolean;
    size?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}
```

### First and Last

Let's say we have a line sparkline where the markers are all `blue` but we want to make the first and last markers stand out with a `yellow` fill and stroke style.

We can do this by adding the following formatter to the marker options.

<snippet>
|const lineMarkerFormatter = (params) => {
|    const { first, last } = params;
|
|    return {
|        fill: first || last ? 'yellow' : 'blue',
|        stroke: first || last ? 'yellow' : 'blue'
|    }
|}
</snippet>

Then in the marker options

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'history',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    marker: {
                        // add lineMarkerFormatter to marker options
                        formatter: lineMarkerFormatter,
                    },
                },
            },
        },
        // other column definitions ...
    ],
};
</snippet>

### Min and Max

Similar to first and last, to emphasise the min and max data points, the `min` and `max` booleans from the formatter params can be used to conditionally style the markers.

<snippet>
|const lineMarkerFormatter = (params) => {
|    const { min, max } = params;
|
|    return {
|        fill: min ? 'orange' : max ? 'green' : 'blue',
|        stroke: min ? 'orange' : max ? 'green' : 'blue'
|    }
|}
</snippet>

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'history',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    marker: {
                        // add lineMarkerFormatter to marker options
                        formatter: lineMarkerFormatter,
                    },
                },
            },
        },
        // other column definitions ...
    ],
};
</snippet>

## Column Sparkline Points of Interest

The formatter callback function for column sparkline applies to the individual columns.

The formatter will receive the following input:

```ts
export interface ColumnFormatterParams {
    datum: any;
    xValue: any; // x value of the column
    yValue: any; // y value of the column
    width: number; // the width of the column
    height: number; // the height of the column
    min? : boolean; // whether or not the marker is a minimum point
    max?: boolean; // whether or not the marker is a maximum point
    first?: boolean; // whether or not the marker represents the first data point
    last?: boolean; // whether or not the marker represents the last data point
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    highlighted: boolean; // whether or not the column is highlighted
}
```
This formatter allows these column attributes to be customised:

- fill
- stroke
- strokeWidth

The formatter return type is `ColumnFormat`.

```ts
export interface ColumnFormat {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}
```
### Negative and Positive

The negative and positive values can be distinguished by adding a formatter which returns styles based on the `yValue` of the data point.

This is demonstrated in the snippet below.

<snippet>
|const lineMarkerFormatter = (params) => {
|    const { yValue } = params;
|
|    return {
|        // if yValue is negative, the column should be 'red', otherwise it should be 'green'
|        fill: yValue < 0 ? 'red' : 'green',
|        stroke: yValue < 0 ? 'red' : 'green'
|    }
|}
</snippet>

Then in the sparkline options:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'sparkline',
            headerName: 'Column Sparkline',
            minWidth: 100,
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'column',
                    // add columnFormatter to sparklineOptions
                    formatter: columnFormatter
                },
            },
        },
        // other column definitions ...
    ],
};
</snippet>

## Example: Special Points

The example below shows formatting of special points for line, area and column sparklines.

It should be noted that

- The highlighted property on the params is used to distinguish between highlighted and un-highlighted states.
- The formatter for line and area sparklines is added to the marker options
- The size property is returned from the area and line formatters to make certain special markers visible and the rest invisible.

<grid-example title='Sparkline Special Points' name='sparkline-special-points' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Interfaces

### MarkerFormatterParams

<interface-documentation interfaceName='MarkerFormatterParams' ></interface-documentation>

### MarkerFormat

<interface-documentation interfaceName='MarkerFormat' ></interface-documentation>

### ColumnFormatterParams

<interface-documentation interfaceName='ColumnFormatterParams' ></interface-documentation>

### ColumnFormat

<interface-documentation interfaceName='ColumnFormat' ></interface-documentation>
