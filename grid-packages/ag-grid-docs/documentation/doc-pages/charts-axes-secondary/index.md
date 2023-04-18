---
title: "Secondary Axes"
---
Secondary axes are typically used to compare data sets with different scales, where extra y-axes are usually located 
on the opposite side of the chart.

## Configuring Secondary Axes

For each secondary axis an axis configuration is required to associate the axis with the appropriate series using 
the `keys` axis property. A sample configuration is shown below:

An extra axis configuration is needed to associate a secondary axis with a given series, where the `keys` axis property 
links the appropriate series to the axis. A sample configuration is shown below:

```js
axes: [
    // x-axis
    {
        type: "category",
        position: "bottom",
    },
    // primary y-axis
    {
        type: "number",
        position: "left",
        keys: ["male", "female"],
    },
    // secondary y-axis
    {
        type: "number",
        position: "right",
        keys: ["exportedTonnes"],
    }
]
```

In the snippet above, a secondary y-axis is positioned to the `right` of the chart showing the `exportedTonnes`.

The following example demonstrates a secondary y-axis. Note the following:

- The axis `keys` property on the primary axis (left) matches the `yKeys` of the `column` series.
- The axis `keys` property on the secondary axis (right) matches the `yKey` of the `line` series.

<chart-example title='Secondary y-axis' name='multiple-axes' type='generated'></chart-example>