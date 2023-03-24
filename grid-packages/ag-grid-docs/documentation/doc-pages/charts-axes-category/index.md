---
title: "Category Axis"
---

A category axis is used to display distinct categories or groups of data in a chart. 

The category axis shows discrete categories or groups of data, unlike the [Number](/charts-axes-number/) or 
[Time](/charts-axes-time/) axes which use a continuous scale. For instance, In a bar chart of sales per quarter, the 
category axis shows the quarters as different groups, and the number axis displays the sales for each group.

## Configuration

If no `axes` are supplied, a category axis will be used as the x-axis by default. However, it can also
be explicitly configured as shown below: 

```js
axes: [
    {
        type: 'category',
        position: 'bottom',
    },
]
```

The category axis will attempt to render an [Axis Tick](/charts-axes-ticks/), [Axis Label](/charts-axis-labels/) and
[Grid Line](/charts-axis-grid-lines/) for each category with even spacing.

## API Reference

<interface-documentation interfaceName='AgCategoryAxisOptions' overridesrc="charts-api/api.json" exclude='["keys"]' config='{ "showSnippets": false, "lookupRoot": "charts-api" }'></interface-documentation>

## Next Up

Continue to the next section to learn about the [Number Axis](/charts-axes-number/).