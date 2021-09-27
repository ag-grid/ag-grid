---
title: "Sparklines - Tooltips"
enterprise: true
---

This section introduces the Sparkline Tooltips

## Default Sparkline Tooltips

Tooltips are enabled for sparklines by default. The content contained in each tooltip is the y value of the provided data. If the title property is specified in the `sparklineOptions`, a tooltip title will also be visible.

The default sparkline tooltip has the following template:

```html
<div class="ag-sparkline-tooltip">
    <div class="ag-sparkline-tooltip-title"></div>
    <div class="ag-sparkline-tooltip-content"></div>
</div>
```

The title element may or may not exist but the content element is always present and by default it contains the y value of the provided data. In the screenshots below the content element of both tooltips contains `200.68`:

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/tooltip-no-title.png" alt="Tooltip without the title element" width="250px" constrained="true">No Title</image-caption>
    <image-caption src="resources/tooltip-with-title.png" alt="Tooltip with a title element" width="250px" constrained="true">With Title</image-caption>
</div>

To make the tooltip title visible you need to specify the title.


<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'history',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'line',
                    line: {
                        stroke: 'skyblue',
                    },
                    marker: {
                        shape: 'diamond',
                        size: '3'
                    },
                    highlightStyle: {
                        size: 5,
                    },
                    tooltip: {
                        enabled: true,
                        renderer: tooltipRenderer
                    }
                }
            },
        },
        // other column definitions ...
    ],
};
</snippet>

In the snippet above, the `sparklineOptions` provided in the `cellRendererParams` property is of type `LineSparklineOptions`.

This is an example to further demonstrate how line sparklines can be configured and customised to your liking or branding by using the available options to add styles.

- The `sparklineOptions` object contains the properties that get applied to the line and every marker. In this example, the shape of every marker is set to `diamond`.
- Refer to the [LineSparklineOptions](/sparklines-line-sparkline/#linesparklineoptions) interface for the attributes which can be customised in a line sparkline.
- The formatter callback function is used to override the default property values for individual markers based on the data they represent.
- The formatter callback function is passed `MarkerFormatterParams` which provides information about the data associated with each Marker. This function should return an object of type `MarkerFormat`.
- Here, when the marker is not highlighted, if the y value of the data point is less than 0, the fill and stroke are set to `green`, otherwise they are set to `skyblue`.
- See the [MarkerFormat](/sparklines-line-sparkline/#markerformat) interface for the attributes which can be customised using this formatter.


<grid-example title='Sparkline Tooltips' name='sparkline-tooltip' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## SparklineTooltip

<interface-documentation interfaceName='SparklineTooltip' ></interface-documentation>

## Next Up

Continue to the next section to learn about: [Sparkline Points of Interest](/sparklines-points-of-interest/).
