---
title: "Axis Grid Lines"
---

This section axis grid lines.

## Axis Grid Lines

Chart axes feature grid lines by default. Grid lines extend from axis ticks on the other side of the axis into the series area, so that it's easy to trace a series item such as a marker to a corresponding tick/label.

Grid lines have the same stroke width as ticks.

Grid lines of each axis can be styled individually via the `gridStyle` config. The config takes an array of objects with two properties:

- `stroke`: colour string in hex, <a href="https://www.w3.org/TR/css-color-4/#typedef-named-color" target="blank">named</a>, rgb, or rgba format.
- `lineDash`: an array of numbers that specify distances to alternately draw a line and a gap. If the number of elements in the array is odd, the elements of the array get copied and concatenated. For example, `[5, 15, 25]` will become `[5, 15, 25, 5, 15, 25]`. If the array is empty, the grid lines will be solid without any dashes.

Each config object in the `gridStyle` array is alternately applied to the grid lines of the axis.

### Example: Grid Lines

<chart-example title='Axis Grid Lines' name='axis-grid-lines' type='generated'></chart-example>

## Next Up

Continue to the next section to learn more about [overlays](/charts-overlays/).