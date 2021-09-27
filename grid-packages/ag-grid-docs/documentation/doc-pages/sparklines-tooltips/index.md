---
title: "Sparklines - Tooltips"
enterprise: true
---

This section shows how sparkline tooltip styles and contents can be customised using the tooltip options.

## Default Sparkline Tooltips

Tooltips are enabled for sparklines by default.

The default sparkline tooltip has the following template:

```html
<div class="ag-sparkline-tooltip">
    <div class="ag-sparkline-tooltip-title"></div>
    <div class="ag-sparkline-tooltip-content"></div>
</div>
```

The title element may or may not exist but the content element is always present and by default it contains the y value of the supplied data.

If both x and y values are supplied, the x value will be shown in the title div and the y value will be displayed in the content div.

In the screenshots below the content element of both tooltips contains `-35`:

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/tooltip-no-title.png" alt="Tooltip without the title element" width="250px" constrained="true">No Title</image-caption>
    <image-caption src="resources/tooltip-title.png" alt="Tooltip with a title element" width="250px" constrained="true">With Title</image-caption>
</div>

Tooltips can be removed by setting `enabled` to `false` in `tooltip` options as shown below.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'history',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    tooltip: {
                        enabled: false, // removes tooltips from the sparklines
                    }
                }
            },
        },
        // other column definitions ...
    ],
};
</snippet>

## Tooltip Renderer

### Modifying Tooltip Content/Title

To modify the tooltips, provide a tooltip `renderer` function in `tooltip` options.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'history',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    tooltip: {
                        renderer: tooltipRenderer // Add tooltip renderer callback function to customise tooltip styles and content
                    }
                }
            },
        },
        // other column definitions ...
    ],
};
</snippet>

- The `renderer` is a callback function which receives data values associated with the highlighted data point.
- It returns an object with the `content` and `title` properties containing plain text or inner HTML that goes into the corresponding divs.

Here's an example renderer function.

```js
const tooltipRenderer = (params) => {
    const { yValue, xValue } = params;
    return {
        content: yValue.toFixed(1), // format number values to have one digit after the decimal point
        title: xValue.toLocaleDateString('en-GB') // format date values to British English date strings
    }
}
```

- In the snippet above, the renderer function sets `content` to formatted Y values that have only 1 digit after the decimal point.
- The title of the tooltips is set to X values provided in the params formatted using the `toLocaleString()` method. This is optional, if X values are provided in the data, they will be formatted and displayed in the tooltip title by default.


<grid-example title='Sparkline Tooltips Custom Content and Title' name='sparkline-tooltip-content' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>


### Styling Tooltips

The `renderer` function can return style attributes such as `color`, `backgroundColor` and `opacity` for the title.

For example, to make the background of the tooltip title `olive` with opacity `0.8` add the following

```js
const tooltipRenderer = (params) => {
    const { context } = params;
    return {
        // sets styles for tooptip title
        color: 'white',
        backgroundColor: 'olive',
        opacity: 0.8
    }
}
```

The applied styles can be seen in the example below.

<grid-example title='Sparkline Tooltips Custom Styling' name='sparkline-tooltip-styles' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>


## Accessing Grid Data

The tooltip `renderer` function discussed above also receives a `context` object in its input. This is really useful as it can be used to access other row data for display in the tooltips.

Let's say we want to display the value of another column in the same row in the tooltip title, this can be achieved using the following renderer function.

```js
const tooltipRenderer = (params) => {
    const { context } = params;
    return {
        title: context.data.symbol, // sets title of tooltips to the value for the 'symbol' field
    }
}
```

The example below demonstrates this.

<grid-example title='Sparkline Tooltips Context' name='sparkline-tooltip-context' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Interfaces
The interfaces for the available options are as follows:

## SparklineTooltip

<interface-documentation interfaceName='SparklineTooltip' ></interface-documentation>

## Next Up

Continue to the next section to learn about: [Sparkline Points of Interest](/sparklines-points-of-interest/).
