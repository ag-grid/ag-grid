---
title: "Themes"
---

Themes allow you customise the appearance of your charts. They provide defaults for different properties of the chart that will be used unless overridden by the chart options.

## Using Stock Themes

Every chart uses the `'ag-default'` theme unless configured otherwise:

```js
AgChart.create({
    theme: 'ag-default', // optional, implied
    //...
});
```

The following themes are provided out-of-the-box:

```ts
type AgChartThemeName = 'ag-default' | 'ag-default-dark'
    | 'ag-material' | 'ag-material-dark'
    | 'ag-pastel' | 'ag-pastel-dark'
    | 'ag-solar' | 'ag-solar-dark'
    | 'ag-vivid' | 'ag-vivid-dark';
```

### Example: Stock Themes

In the example below, you can click the buttons to change the theme used in the chart. Notice how changing from one theme to another is a simple matter of changing the `theme` property on the original `options` object and passing it to `AgChart.update(chart, options)` along with the chart instance.

<chart-example title='Stock Themes' name='stock-themes' type='generated'></chart-example>

## Making Custom Themes

You can create your own theme, which builds upon an existing theme and allows you to change as many or as few properties as you like. A custom theme is an object with the following properties:

- `baseTheme` - the name of the theme to base this theme upon (optional; if not specified, the `'ag-default'` theme is used)
- `overrides` - the object to be merged with the base theme's defaults and override them (optional)
- `palette` - the palette to use, replaces the palette of the base theme (optional)

The `overrides` object is similar in its structure to the chart's options, with two noteworthy exceptions:

- the `series` config is an object that maps each series type to its config
- the `axes` config is an object that maps each axis type to its config

For example, the following snippet demonstrates a custom theme that uses the `'ag-default-dark'` theme as the base to inherit the dark background and bright strokes, but substitutes the palette and changes some fonts, as well as a few other options.

```js
var myTheme = {
    baseTheme: 'ag-default-dark',
    palette: {
        fills: [
            '#5C2983',
            '#0076C5',
            '#21B372',
            '#FDDE02',
            '#F76700',
            '#D30018'
        ],
        strokes: ['black']
    },
    overrides: {
        cartesian: {
            title: {
                fontSize: 24
            },
            series: {
                column: {
                    label: {
                        enabled: true,
                        color: 'black'
                    }
                }
            }
        }
    }
};
```

### Example: Custom Theme

The theme shown in the above snippet is applied to the chart in the example below:

<chart-example title='Custom Theme' name='custom-theme' type='generated' ></chart-example>

### Example: Advanced Theme

This example demonstrates a more advanced theme, providing different settings for different series and axis types.

<chart-example title='Advanced Themes' name='advanced-theme' type='multi'></chart-example>