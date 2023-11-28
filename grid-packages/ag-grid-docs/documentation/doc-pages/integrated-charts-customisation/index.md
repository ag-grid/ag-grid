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

The selected theme can be changed by the user via the [Settings Tool Panel](/integrated-charts-chart-tool-panels/) or
by changing the order of the provided themes using the `chartThemes` grid option as shown below:

<snippet spaceBetweenProperties="true">
| const gridOptions = {
|     chartThemes: ['ag-vivid', 'ag-polychroma', 'ag-material', 'ag-sheets', 'ag-default']
| }
</snippet>

## Overriding Themes

Integrated Charts uses a theme based configuration which 'overrides' the theme defaults.

To override a charts theme, use the `chartsThemeOverrides` grid option.

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

<note>
Note that the `chartThemeOverrides` grid option maps to [AG Charts Theme Overrides](https://charts.ag-grid.com/themes-api/#reference-AgChartTheme-overrides).
</note>

The following sections show different types of chart and series overrides.

### Common Overrides

These overrides can be used with any series type. For full list of overrides see [Common Overrides](https://charts.ag-grid.com/themes-api/overrides/common/#reference-AgCommonThemeableChartOptions).

<grid-example title='Common Overrides' name='common-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

### Line Overrides

These overrides are specific to the [AG Charts Line Series](https://charts.ag-grid.com/react/line-series/). For full list of overrides see [Line Overrides](https://charts.ag-grid.com/themes-api/overrides/line/#reference-AgLineSeriesThemeOverrides).

<grid-example title='Line Overrides' name='line-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

### Bar Overrides

These overrides are specific to the [AG Charts Bar Series](https://charts.ag-grid.com/react/bar-series/). For full list of overrides see [Bar Overrides](https://charts.ag-grid.com/themes-api/overrides/bar/#reference-AgBarSeriesThemeOverrides).

<grid-example title='Bar Overrides' name='bar-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

### Area Overrides

These overrides are specific to the [AG Charts Area Series](https://charts.ag-grid.com/react/area-series/). For full list of overrides see [Bar Overrides](https://charts.ag-grid.com/themes-api/overrides/area/#reference-AgAreaSeriesThemeOverrides).

<grid-example title='Area Overrides' name='area-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

### Scatter Overrides

These overrides are specific to the [AG Charts Scatter Series](https://charts.ag-grid.com/react/scatter-series/). For full list of overrides see [Scatter Overrides](https://charts.ag-grid.com/themes-api/overrides/scatter/#reference-AgScatterSeriesThemeOverrides).

<grid-example title='Scatter Overrides' name='scatter-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

### Pie Overrides

These overrides are specific to the [AG Charts Pie Series](https://charts.ag-grid.com/react/pie-series/). For full list of overrides see [Pie Overrides](https://charts.ag-grid.com/themes-api/overrides/pie/#reference-AgPieSeriesThemeOverrides).

<grid-example title='Pie Overrides' name='pie-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

## Custom Chart Themes

Custom [AG Charts Themes](https://charts.ag-grid.com/react/themes/) can also be supplied to the grid via the `customChartThemes` grid option.

<snippet spaceBetweenProperties="true">
| const gridOptions = {
|     customChartThemes: {
|         myCustomTheme: {
|             palette: {
|                 fills: ['#42a5f5', '#ffa726', '#81c784'],
|                 strokes: ['#000000', '#424242'],
|             },
|             overrides: {
|                 common: {
|                     background: {
|                         fill: '#f4f4f4',
|                     },
|                     legend: {
|                         item: {
|                             label: {
|                                 color: '#333333',
|                             },
|                         },
|                     },
|                 },
|             },    
|         },
|         chartThemes: ['myCustomTheme', 'ag-vivid'],
|     }
| }
</snippet>

The example below shows a custom chart theme being used with the grid. Note that other provided themes can be used 
alongside a custom theme, and are unaffected by the settings in the custom theme.

<grid-example title='Custom Chart Theme' name='custom-chart-theme' type='generated' options='{ "exampleHeight": 660,"enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

## Next Up

Continue to the next section to learn about: [Chart Events](/integrated-charts-events/).



