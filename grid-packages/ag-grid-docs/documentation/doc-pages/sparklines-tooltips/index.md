---
title: "Sparklines - Tooltips"
enterprise: true
---

This section shows how sparkline tooltip styles and contents can be customised using the tooltip options.

## Disabling Sparkline Tooltips

Tooltips are enabled by default, however they can be disabled via the `tooltip` options as shown below:

```js
sparklineOptions: {
    tooltip: {
        enabled: false, // removes sparkline tooltips
    }
}
```

## Default Tooltip Template

The default tooltip will show Y values in the __Content__ section, whereas X values are shown in the __Title__ section,
if they exist in the data.

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/tooltip-no-title.png" alt="Tooltip without the title element" width="250px" constrained="true">No Title</image-caption>
    <image-caption src="resources/tooltip-title.png" alt="Tooltip with a title element" width="250px" constrained="true">With Title</image-caption>
</div>

The default sparkline tooltip has the following template:

```html
<div class="ag-sparkline-tooltip">
    <div class="ag-sparkline-tooltip-title"></div>
    <div class="ag-sparkline-tooltip-content"></div>
</div>
```

## Tooltip Renderer

To modify the tooltips, a tooltip `renderer` function can be supplied to `tooltip` options as shown below:

```js
sparklineOptions: {
    tooltip: {
        renderer: tooltipRenderer // Add tooltip renderer callback function to customise tooltip styles and content
    }
}
```           

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


<grid-example title='Sparkline Tooltip Renderer' name='sparkline-tooltip-renderer' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Styling Tooltips

The [Tooltip Renderer](/sparklines-tooltips/#tooltip-renderer) can also be used to style tooltips. The `renderer` function
can return style attributes such as `color`, `backgroundColor` and `opacity` for the title. For example, to make the 
background of the tooltip title `olive` with opacity `0.8` add the following:

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

The following example demonstrates these tooltip styles:

<grid-example title='Styling Sparkline Tooltips' name='sparkline-tooltip-styles' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Accessing Row Data

The params supplied to the [Tooltip Renderer](/sparklines-tooltips/#tooltip-renderer) includes a `context` object 
with a `data` property containing row data. This is useful when data from other columns needs to be shown in tooltips.

The following snippet shows how values from the 'Symbol' column can be shown in the tooltip title:   

```js
const tooltipRenderer = (params) => {
    const { context } = params;
    return {
        title: context.data.symbol, // sets title of tooltips to the value for the 'symbol' field
    }
}
```

The following example demonstrates how data from the 'Symbol' column can be shown in the tooltip title:

<grid-example title='Accessing Row Data' name='sparkline-accessing-row-data' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Interfaces

### SparklineTooltip

<interface-documentation interfaceName='SparklineTooltip'></interface-documentation>

## Next Up

Continue to the next section to learn about: [Sparkline Points of Interest](/sparklines-points-of-interest/).
