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

The default tooltip will show the Y value of the hovered item in the __Content__ section of the tooltip, and the X value (if it exists) is displayed in the __Title__ section of the tooltip. Both of these sections are inline <span> elements.

See the screenshots below for illustrations of these two cases.

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/tooltip-no-title.png" alt="Tooltip without the title element" width="250px" constrained="true">No Title</image-caption>
    <image-caption src="resources/tooltip-with-title.png" alt="Tooltip with a title element" width="250px" constrained="true">With Title</image-caption>
</div>

## Customising The Default Tooltip

The default sparkline tooltip has the following template:

```html
    <div class="ag-sparkline-tooltip">
        <span class="ag-sparkline-tooltip-title"></span>
        <span class="ag-sparkline-tooltip-content"></span>
    </div>
```

### Modifying Title and Content

The tooltips can be customised using a tooltip `renderer` function supplied to the `tooltip` options as shown below:

```js
sparklineOptions: {
    tooltip: {
        renderer: tooltipRenderer // Add tooltip renderer callback function to customise tooltip styles and content
    }
}
```

- The `renderer` is a callback function which receives data values associated with the highlighted data point.
- It returns an object with the `content` and `title` properties containing plain text that is used for the __Content__ and __Title__ sections of the tooltip.
- Alternatively, the `content` property could contain a string representing HTML content, which can be used to provide completely [Custom Tooltips](/sparklines-tooltips/#custom-tooltip).

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

### Example: Tooltip Title and Content

<grid-example title='Sparkline Tooltip Renderer' name='sparkline-tooltip-renderer' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

### Modifying Styles

The `renderer` function can return style attributes such as `color`, `backgroundColor` and `opacity` for the tooltip as shown below:

```js
const tooltipRenderer = (params) => {
    return {
        // sets styles for tooltip
        color: 'white',
        backgroundColor: 'red',
        opacity: 0.3
    }
}
```
### Example: Tooltip Styles

The following example demonstrates the results of the tooltip styles above:

<grid-example title='Styling Sparkline Tooltips' name='sparkline-tooltip-styles' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>


[[note]]
| Default tooltip styles can also be changed by using the CSS class selector to select the tooltip HTML elements with the following class attributes: `ag-sparkline-tooltip`, `ag-sparkline-tooltip-title`, `ag-sparkline-tooltip-content`, and modifying the style definitions in a stylesheet file.

### Modifying Container and Offset

The tooltip position relative to the mouse cursor can be modified using the `xOffset` and `yOffset` properties in `tooltip` options as shown below:

```js
sparklineOptions: {
    tooltip: {
            xOffset: 0, // positions tooltip 0px to the right of the top left of the mouse cursor
            yOffset: 20, // positions tooltip 20px down from the top left of the mouse cursor
    }
}
```

By default the tooltip is confined to the length of the sparkline cell, which can be changed by providing a container HTML element to allow the tooltip to overflow the cell.

In the snippet below, the tooltip container has been configured to be the `document.body` which allows the tooltip to be positioned anywhere within the <body> node of the current document.

```js
sparklineOptions: {
    tooltip: {
        container: document.body, // confines the tooltip to the document body node instead of the sparkline cell
    }
}
```

- The effect of the configuration above is that the tooltip will not flip to the left of the mouse cursor when it reaches the end of the sparkline cell width, instead it will only flip if the tooltip position surpasses the document body width.

### Example: Tooltip Container

Here's a live example to demonstrate the configuration above.

- Note that the tooltip is now positioned underneath the mouse cursor and the tooltip width exceeds the sparkline cell as a result of the tooltip `container` configuration.

<grid-example title='Sparkline Tooltip Container' name='sparkline-tooltip-container' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Accessing Row Data

It is possible to display data from other columns of the current row in the sparkline tooltip.
This access is provideded by the input parameter supplied to the [Tooltip Renderer](/sparklines-tooltips/#modifying-title-and-content), which includes a `context` object with a `data` property containing the row data.

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

## Custom Tooltip

Instead of having the tooltip renderer return an object with title and content strings to be used in the default tooltip template, you can return a string with completely custom markup that will overrid the template.

We could use the following tooltip renderer to return custom HTML for the sparkline tooltip:

```js
const tooltipRenderer = (params) => {
    const { yValue, context } = params;
    return `<div class='my-custom-tooltip'>
                <span class='tooltip-title'>${context.data.symbol}</span>
                <span class='tooltip-content'>${yValue}</span>
            </div>`;
}
```

The tooltip renderer function receives the `params` object as a single parameter. Inside that object you get the `xValue` and `yValue` for the highlighted data point as well as the reference to the raw `datum` element from the sparkline data array. You can then process the raw values however you like before using them as a part of the returned HTML string.

The effect of applying the tooltip renderer from the snippet above can be seen in the example below.

### Example: Custom Tooltips

Notice that:

- The structure of the returned DOM is up to you, this example returns one `<div>` element, and two `<span>` elements, one for the tooltip's title and another for its content.
- The value of the title comes from `params.context.data.symbol` which is the value for the `symbol` column for the given row.
- Note that each element has a custom CSS class attribute, but the default class names can also be used so that our tooltip gets the default styling.
- The styles for the title and content elements are defined in the external styles.css file.

<grid-example title='Custom Tooltips' name='sparkline-tooltip-custom-html' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>


## Crosshairs

Crosshairs display perpendicular lines running across the sparklines when hovering on a data point. When the mouse is moved, the crosshairs will snap to the closest data point. Crosshairs are only available for line and area sparklines. By default, the vertical crosshair line has been enabled for both line and area sparklines.

The horizontal and vertical crosshair lines can be enabled independently by adding `crosshairs` options as shown below:

```js
sparklineOptions: {
    crosshairs: {
        xLine: {
            enabled: true // enabled by default
        },
        yLine: {
            enabled: false // disabled by default
        }
    }
}
```

The style of the crosshair line, including `stroke`, `strokeWidth`, `lineDash` and `lineCap`, can be customised via the `xline` or `yline` options:

```js
sparklineOptions: {
    crosshairs: {
        xLine: {
            lineDash: 'dash',
            stroke: 'rgba(52, 168, 83, 0.5)',
            strokeWidth: 2,
        },
    }
}
```

### Example: Crosshairs

In this example, the vertical crosshair (xLine) has been customised from the default solid line to a dashed line with a thicker `strokeWidth` and reduced opacity using the `stroke` option.

<grid-example title='Sparkline Crosshairs' name='sparkline-crosshairs' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Interfaces

### SparklineTooltipOptions

<interface-documentation interfaceName='SparklineTooltipOptions' overrideSrc='sparklines-tooltips/resources/sparkline-tooltip-api.json'></interface-documentation>

### TooltipRendererParams

<interface-documentation interfaceName='TooltipRendererParams' ></interface-documentation>

### TooltipRendererResult

<interface-documentation interfaceName='TooltipRendererResult' ></interface-documentation>

## Next Up

Continue to the next section to learn about: [Sparkline Points of Interest](/sparklines-points-of-interest/).
