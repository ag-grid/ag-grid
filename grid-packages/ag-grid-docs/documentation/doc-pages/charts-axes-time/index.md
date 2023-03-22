---
title: "Time Axis"
---

This section covers the Time Axis.

The time axis is similar to the number axis in the sense that it is also used to plot continuous values. The time axis can even be used with numeric data (in addition to `Date` objects), but the numbers will be interpreted as Unix timestamps. The time axis differs from the number axis in tick segmentation and label formatting. For example, you could choose to place a tick every 5 minutes, every month, or every Friday.

The time axis also supports specifier strings to control the way time values are presented as labels. For example, the `%H:%M:%S` specifier string will instruct the axis to format a time value like `new Date('Tue Feb 04 202 15:08:03')` or `1580828883000` as `'15:08:03'`. Time axes are typically used as x-axes and placed at the bottom of a chart. The simplest time axis config looks like this:

```js
{
    type: 'time',
    position: 'bottom'
}
```

<interface-documentation interfaceName='AgTimeAxisOptions' overridesrc="charts-api/api.json" config='{ "showSnippets": false, "lookupRoot": "charts-api" }' exclude='["position", "title", "line", "label", "gridStyle", "keys"]'></interface-documentation>

## Next Up

Continue to the next section to learn about the [Time Axis](/charts-axes-time/).