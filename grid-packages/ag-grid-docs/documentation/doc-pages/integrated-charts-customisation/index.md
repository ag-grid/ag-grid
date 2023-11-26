---
title: "Chart Customisation"
enterprise: true
---

Integrated Charts can be customised via the [AG Charts Theme API](https://charts.ag-grid.com/themes-api/).

## Provided Themes

The following themes are provided to Integrated Charts by default.

```js
['ag-default', 'ag-material', 'ag-sheets', 'ag-polychroma', 'ag-vivid']
```

These themes correspond to [AG Charts Base Themes](https://charts.ag-grid.com/themes-api/#reference-AgChartTheme-baseTheme). 

<note>
When using a dark theme for the grid (e.g. `ag-theme-quartz-dark`), dark equivalents of the chart themes are provided by
default instead, named with a `-dark` suffix, e.g. `'ag-vivid-dark'`.
</note>

When you create a chart, you can scroll through the different available themes in the [Settings Tool Panel](/integrated-charts-chart-tool-panels/).

It is possible to change the order of the provided themes using the `chartThmes` grid option as shown below:

<snippet spaceBetweenProperties="true">
| const gridOptions = {
|     chartThemes: ['ag-vivid', 'ag-polychroma', 'ag-material', 'ag-sheets', 'ag-default']
| }
</snippet>

## Custom Chart Themes

You can create your own chart theme and provide it to the grid in the `customChartThemes` map on `gridOptions`. Your 
theme should then be specified in `chartThemes` to make it available to your users.

<snippet spaceBetweenProperties="true">
| const gridOptions = {
|     customChartThemes: {
|         myCustomTheme: {
|             baseTheme: 'ag-pastel',
|             palette: {
|                 fills: ['#c16068', '#a2bf8a', '#ebcc87'],
|                 strokes: ['#874349', '#718661', '#a48f5f']
|             },
|             overrides: {
|                 common: {
|                     title: {
|                         fontSize: 22,
|                         fontFamily: 'Arial, sans-serif'
|                     }
|                 }
|             }
|         }
|     },
|     chartThemes: ['myCustomTheme', 'ag-vivid']
| }
</snippet>

The example below shows a custom chart theme being used with the grid. Note that other provided themes can be used alongside a custom theme, and are unaffected by the settings in the custom theme.

<grid-example title='Custom Chart Theme' name='custom-chart-theme' type='generated' options='{ "exampleHeight": 660,"enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

## Overriding Existing Themes

Instead of providing a whole custom chart theme, you can simply use the `chartsThemeOverrides` grid option, which maps 
to [AG Charts Theme Overrides](https://charts.ag-grid.com/themes-api/#reference-AgChartTheme-overrides).

<snippet>
const gridOptions = {
    chartThemeOverrides: {
        common: {
            title: {
                fontSize: 22,
                fontFamily: 'Arial, sans-serif'
            }
        }
    }
}
</snippet>

The following examples show different types of chart being customised using theme overrides.

### Common Chart Overrides

These overrides can be used with any chart type.

<grid-example title='Common Chart Overrides' name='common-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

### Line Chart Overrides

<grid-example title='Line Chart Overrides' name='line-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

### Bar/Column Chart Overrides

<grid-example title='Bar/Column Chart Overrides' name='bar-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

### Area Chart Overrides

<grid-example title='Area Chart Overrides' name='area-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

### Scatter/Bubble Chart Overrides

<grid-example title='Scatter/Bubble Chart Overrides' name='scatter-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

### Pie/Doughnut Chart Overrides

<grid-example title='Pie/Doughnut Chart Overrides' name='pie-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

### Histogram Chart Overrides

<grid-example title='Histogram Chart Overrides' name='histogram-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

## Next Up

Continue to the next section to learn about: [Chart Events](/integrated-charts-events/).



