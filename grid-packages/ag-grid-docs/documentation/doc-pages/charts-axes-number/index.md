---
title: "Number Axis"
---

This section covers the Number Axis.

The number axis is meant to be used as a value axis. While categories are spaced out evenly, the distance between values depends on their magnitude.

Instead of using one tick per value, the number axis will determine the range of all values, round it up and try to segment the rounded range with evenly spaced ticks.

The number axis is used as the y-axis by default, positioned to the left a chart.

Here's the simplest number axis config:

```js
{
    type: 'number',
    position: 'left'
}
```

<interface-documentation interfaceName='AgNumberAxisOptions' overridesrc="charts-api/api.json" config='{ "showSnippets": false, "lookupRoot": "charts-api" }' exclude='["position", "title", "line", "label", "gridStyle", "keys"]'></interface-documentation>

## Next Up

Continue to the next section to learn about the [Log Axis](/charts-axes-log/).