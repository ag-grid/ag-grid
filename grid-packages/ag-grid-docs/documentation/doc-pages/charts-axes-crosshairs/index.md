---
title: "Axis Crosshairs"
---

Crosshairs are used to display a reference line with the corresponding axis value at a position on the chart.

When the chart is hovered, crosshairs can be displayed following the mouse pointer position or can snap to the position of the highlighted item to show the value of the axis at that position.

## Enabling Crosshairs

To enable the crosshair feature for a given axis, use the `crosshair` property on the `axes` options object as shown below:

```js
axes: [
  {
    type: "number",
    position: "left",
    crosshair: {
      // crosshair configuration for the bottom axis.
    },
  },
]
```

[Crosshair Example](https://plnkr.co/edit/X5sAPyvHaWTB8JeH?open=main.js)

## Crosshair Snap

By default, for continuous axes such as [Number](/charts-axes-number/) or
[Time](/charts-axes-time/) axes, the crosshair will follow the mouse pointer.

This default behaviour can be modified by using the crosshair `snap` option. When `snap` is `true`, the crosshair will snap to the highlighted item rather than following the mouse pointer.

```js
axes: [
  {
    type: "number",
    position: "bottom",
    crosshair: {
      snap: true,
    },
  },
]
```

[Crosshair Snap Example](https://plnkr.co/edit/fy39QecBt7zHGvTq?open=main.js)

For [Category](/charts-axes-category/) axes, as the axis values are discrete categories, the crosshair will snap to the closest category by default.

## Crosshair Styles

Crosshair styles such as `stroke`, `strokeWidth` and `lineDash` are customisable via `AgCrosshairOptions`.

```js
crosshair: {
    stroke: '#7290C4',
    strokeWidth: 2,
    lineDash: [5, 10],
},
```

[Crosshair Styles Example](https://plnkr.co/edit/Hpg5pU3qMlIVlct2?open=main.js)

## Crosshair Label

The crosshair label will be displayed along the axis by default. The label can be removed via the crosshair `label` option as shown in the code snippet below:

```js
crosshair: {
    label: {
        enabled: false // removes crosshair label
    }
},
```

## Crosshair Label position

The label position relative to the crosshair can be modified using the `xOffset` and `yOffset` properties in `crosshair.label` options as shown below:

```js
crosshair: {
    label: {
            xOffset: 20, // positions label 20px to the right of the start of the crosshair line
            yOffset: 20, // positions label 20px down from the start of the crosshair line
    }
}
```

[Crosshair Label Offset Example](https://plnkr.co/edit/9roaj4NYZUMo9eIn?open=main.js)

## Crosshair Label Renderer

### Default Label

The default crosshair label is customisable using the crosshair label `renderer` option as shown below:

```js
crosshair: {
    label: {
        renderer: labelRenderer // Add label renderer callback function to customise label styles and content
    }
},
```

- The `renderer` is a callback function which receives the axis `value` and its `fractionDigits` used for formatting the value at the crosshair position.
- It returns an object with the `text` value as well as style attributes including `color`, `backgroundColor` and `opacity` for the crosshair label:

```js
const labelRenderer = ({ value, fractionDigits }) => {
  return {
    text: value.toFixed(fractionDigits),
    color: "aliceBlue",
    backgroundColor: "darkBlue",
    opacity: 0.8,
  }
}
```

[Crosshair Default Label Example](https://plnkr.co/edit/kGvyJxcQhBD9u1YL?open=main.js)

More styling can be applied using the CSS class selector to select the label HTML element with the `ag-crosshair-label` class attribute, and modifying the style definitions in a stylesheet file.

This is shown in the example below. Note that:

- The default label template is used and the style definitions are overriden in the styles.css file.

[Crosshair Default Label Style Example](https://plnkr.co/edit/7jBVxaNgHDw2NqUz?open=main.js)

### Custom Label

Alternatively, the `renderer` function could return a `string` representing HTML content, which can be used to provide a completely custom label:

```js
const labelRenderer = ({ value, fractionDigits }) => {
  return `<div class='custom-crosshair-label custom-crosshair-label-arrow'>
            ${value.toFixed(fractionDigits)}</div>`
}
```

The `renderer` function receives a single object with the axis `value` and `fractionDigits`.

The effect of applying the `renderer` from the snippet above can be seen in the example below.

Note that:

- The structure of the returned DOM is up to you.
- The elements have custom CSS class attributes, but the default class names can also be used so that the label gets the default styling.
- The styles for the elements are defined in the external styles.css file.

[Crosshair Custom Label Style Example](https://plnkr.co/edit/uVT3wf3mRqmazuOe?open=main.js)
