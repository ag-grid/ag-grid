---
title: "Number Axis"
---
A number axis is used to display continuous numerical values in a chart.

The number axis displays continuous numerical values, unlike the [Category](/charts-axes-category/) axis which displays
discrete categories or groups of data. This means that while categories are spaced out evenly, the distance between values
in a number axis will depend on their magnitude.

Instead of using one [Axis Tick](/charts-axes-ticks/) per value, the number axis will determine the range of all values, 
round it up and try to segment the rounded range with evenly spaced ticks.

## Configuration

If no `axes` are supplied, a number axis will be used as the y-axis by default. However, it can also be explicitly 
configured as shown below:

```js
axes: [
    {
        type: 'number',
        position: 'left',
    },
]
```

## API Reference

<interface-documentation interfaceName='AgNumberAxisOptions' overridesrc="charts-api/api.json" exclude='["keys"]' config='{ "showSnippets": false, "lookupRoot": "charts-api" }'></interface-documentation>

## Next Up

Continue to the next section to learn about the [Log Axis](/charts-axes-log/).