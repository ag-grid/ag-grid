---
title: "Sparklines - Tooltips"
enterprise: true
---

This section shows how sparkline tooltip styles and contents can be customised using the tooltip options.

## Disabling Sparkline Tooltips

Sparkline tooltips are enabled by default. They can be disabled via the `tooltip` options as shown in the code snippet below:

```js
sparklineOptions: {
    tooltip: {
        enabled: false, // removes sparkline tooltips
    }
}
```

## Default Tooltip

The default tooltip will show the Y value of the hovered item in the __Content__ section of the tooltip, whereas the X value (if it exists) is displayed in the __Title__ section of the tooltip.
See the screenshots below for illustrations of these two cases.

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/tooltip-no-title.png" alt="Tooltip without the title element" width="250px" constrained="true">No Title</image-caption>
    <image-caption src="resources/tooltip-title.png" alt="Tooltip with a title element" width="250px" constrained="true">With Title</image-caption>
</div>

## Customising Tooltip Appearance

The default sparkline tooltip has the following template:

```html
<div class="ag-sparkline-tooltip">
    <div class="ag-sparkline-tooltip-title"></div>
    <div class="ag-sparkline-tooltip-content"></div>
</div>
```

The tooltips can be customised using a tooltip `renderer` function supplied to the `tooltip` options as shown below:

```js
sparklineOptions: {
    tooltip: {
        renderer: tooltipRenderer // Add tooltip renderer callback function to customise tooltip styles and content
    }
}
```

- The `renderer` is a callback function which receives data values associated with the highlighted data point.
- It returns an object with the `content` and `title` properties containing plain text or inner HTML that is used for the __Content__ and __Title__ sections of the tooltip.

Here's an example renderer function.

```js
const tooltipRenderer = (params) => {
    const { yValue, xValue } = params;
    return {
        title: new Date(xValue).toLocaleDateString(), // formats date X values
        content: yValue.toFixed(1), // format Y number values
    }
}
```

- In the snippet above, the renderer function sets the tooltip `content` to render Y values formatted with 1 digit after the decimal point.
- The title of the tooltips is set to X values provided in the `params` formatted using the `toLocaleString()` method. This is optional because if X values are provided in the data, they will be formatted and displayed in the tooltip title by default.

<grid-example title='Sparkline Tooltip Renderer' name='sparkline-tooltip-renderer' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Accessing Row Data

The tooltip can also be customised to display data from other columns of the current row.
This access is provideded by the input parameter supplied to the [Tooltip Renderer](/sparklines-tooltips/#tooltip-renderer), which includes a `context` object with a `data` property containing the row data.

The following snippet shows how values from the 'Symbol' column can be shown in the tooltip title:

```js
const tooltipRenderer = (params) => {
    const { context } = params;
    return {
        title: context.data.symbol, // sets title of tooltips to the value for the 'symbol' field
    }
}
```

The following example demonstrates the above tooltip renderer:

<grid-example title='Accessing Row Data' name='sparkline-accessing-row-data' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Styling Tooltip Titles

The tooltip titles can be customised using the [Tooltip Renderer](/sparklines-tooltips/#tooltip-renderer).
The `renderer` function can return style attributes such as `color`, `backgroundColor` and `opacity` for the tooltip title as shown below:

```js
const tooltipRenderer = (params) => {
    return {
        // sets styles for tooptip title
        color: 'white',
        backgroundColor: 'red',
        opacity: 0.3
    }
}
```

The following example demonstrates the results of the tooltip title styles above:

<grid-example title='Styling Sparkline Tooltips' name='sparkline-tooltip-styles' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Interfaces

### SparklineTooltipOptions

<interface-documentation interfaceName='SparklineTooltipOptions' overrideSrc='sparklines-tooltips/resources/sparkline-tooltip-api.json'></interface-documentation>

### TooltipRendererParams

<interface-documentation interfaceName='TooltipRendererParams' ></interface-documentation>

### TooltipRendererResult

<interface-documentation interfaceName='TooltipRendererResult' ></interface-documentation>

## Next Up

Continue to the next section to learn about: [Sparkline Points of Interest](/sparklines-points-of-interest/).
