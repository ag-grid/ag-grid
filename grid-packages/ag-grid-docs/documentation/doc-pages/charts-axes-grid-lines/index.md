---
title: "Axis Grid Lines"
---
Grid lines are the horizontal and vertical lines that divide a chart or graph into smaller sections, providing a visual
reference for interpreting data.

## Customising Grid Lines

Grid lines are shown by default and their display is controlled by the [Axis Ticks](/charts-axes-ticks/).

Grid lines of each axis can be styled individually via the `gridStyle` config. The config takes an array of objects with two properties:

- `stroke`: colour string in hex, <a href="https://www.w3.org/TR/css-color-4/#typedef-named-color" target="blank">named</a>, rgb, or rgba format.
- `lineDash`: an array of numbers that specify distances to alternately draw a line and a gap. If the number of elements in the array is odd, the elements of the array get copied and concatenated. For example, `[5, 15, 25]` will become `[5, 15, 25, 5, 15, 25]`. If the array is empty, the grid lines will be solid without any dashes.

Each config object in the `gridStyle` array is alternately applied to the grid lines of the axis. A sample configuration
is shown below:

```js
gridStyle: [
    {
        stroke: 'gray',
        lineDash: [10, 5],
    },
    {
        stroke: 'lightgray',
        lineDash: [5, 5],
    },
]
```

The following example demonstrates different grid line customisations:

<chart-example title='Axis Grid Lines' name='axis-grid-lines' type='generated'></chart-example>

## Next Up

Continue to the next section to learn about [Secondary Axes](/charts-axes-secondary/).