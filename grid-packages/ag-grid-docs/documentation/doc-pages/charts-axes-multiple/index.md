---
title: "Axes"
---

This section covers multiple axes in a single direction

## Multiple axes in a single direction

If you have two different datasets (each represented by its own series) but they are on vastly different scales, it is possible to have
one series be coordinated by one axis and the other series coordinated by another axis, all in a single chart.

If this is the case, the charting library will need some help in the form of an extra axis config to figure out which series should be
coordinated by which axes. By setting the axis' `keys` config to the keys of the series in question, you let the charting library know
that all series that use that those keys will be coordinated by this axis, as illustrated by the example below.

### Example: Multiple y-axes

Note, that we are:
- using two number axis configurations in the `axes` array
- position one number axis to the `left` and the other to the `right` of the chart
- set the left number axis `keys` to match the `yKey`s of the `column` series
- set the right number axis `keys` to match the `yKey` of the `line` series

<chart-example title='Multiple y-axes' name='multiple-axes' type='generated'></chart-example>

## Next Up

Continue to the next section to learn more about [overlays](/charts-overlays/).