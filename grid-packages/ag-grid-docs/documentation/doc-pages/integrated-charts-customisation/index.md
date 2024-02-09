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

These overrides can be used with any series type. For full list of overrides see [Common Overrides](https://charts.ag-grid.com/themes-api/#reference-AgChartTheme-overrides-common).

<grid-example title='Common Overrides' name='common-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts-enterprise"] }'></grid-example>

### Line Overrides

These overrides are specific to the [AG Charts Line Series](https://charts.ag-grid.com/react/line-series/). For full list of overrides see [Line Overrides](https://charts.ag-grid.com/themes-api/#reference-AgChartTheme-overrides-line).

<grid-example title='Line Overrides' name='line-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts-enterprise"] }'></grid-example>

### Bar Overrides

These overrides are specific to the [AG Charts Bar Series](https://charts.ag-grid.com/react/bar-series/). For full list of overrides see [Bar Overrides](https://charts.ag-grid.com/themes-api/#reference-AgChartTheme-overrides-bar).

<grid-example title='Bar Overrides' name='bar-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts-enterprise"] }'></grid-example>

### Area Overrides

These overrides are specific to the [AG Charts Area Series](https://charts.ag-grid.com/react/area-series/). For full list of overrides see [Area Overrides](https://charts.ag-grid.com/themes-api/#reference-AgChartTheme-overrides-area).

<grid-example title='Area Overrides' name='area-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts-enterprise"] }'></grid-example>

### Scatter Overrides

These overrides are specific to the [AG Charts Scatter Series](https://charts.ag-grid.com/react/scatter-series/). For full list of overrides see [Scatter Overrides](https://charts.ag-grid.com/themes-api/#reference-AgChartTheme-overrides-scatter).

<grid-example title='Scatter Overrides' name='scatter-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts-enterprise"] }'></grid-example>

### Pie Overrides

These overrides are specific to the [AG Charts Pie Series](https://charts.ag-grid.com/react/pie-series/). For full list of overrides see [Pie Overrides](https://charts.ag-grid.com/themes-api/#reference-AgChartTheme-overrides-pie).

<grid-example title='Pie Overrides' name='pie-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts-enterprise"] }'></grid-example>

### Radar Line Overrides

These overrides are specific to the [AG Charts Radar Line Series](https://charts.ag-grid.com/react/radar-line-series/). For full list of overrides see [Radar Line Overrides](https://charts.ag-grid.com/themes-api/#reference-AgChartTheme-overrides-radar-line).

<grid-example title='Radar Line Overrides' name='radar-line-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts-enterprise"] }'></grid-example>

### Radar Area Overrides

These overrides are specific to the [AG Charts Radar Area Series](https://charts.ag-grid.com/react/radar-area-series/). For full list of overrides see [Radar Area Overrides](https://charts.ag-grid.com/themes-api/#reference-AgChartTheme-overrides-radar-area).

<grid-example title='Radar Area Overrides' name='radar-area-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts-enterprise"] }'></grid-example>

### Nightingale Overrides

These overrides are specific to the [AG Charts Nightingale Series](https://charts.ag-grid.com/react/nightingale-series/). For full list of overrides see [Nightingale Overrides](https://charts.ag-grid.com/themes-api/#reference-AgChartTheme-overrides-nightingale).

<grid-example title='Nightingale Overrides' name='nightingale-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts-enterprise"] }'></grid-example>

### Radial Column Overrides

These overrides are specific to the [AG Charts Radial Column Series](https://charts.ag-grid.com/react/radial-column-series/). For full list of overrides see [Radial Column Overrides](https://charts.ag-grid.com/themes-api/#reference-AgChartTheme-overrides-radial-column).

<grid-example title='Radial Column Overrides' name='radial-column-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts-enterprise"] }'></grid-example>

### Radial Bar Overrides

These overrides are specific to the [AG Charts Radial Bar Series](https://charts.ag-grid.com/react/radial-bar-series/). For full list of overrides see [Radial Bar Overrides](https://charts.ag-grid.com/themes-api/#reference-AgChartTheme-overrides-radial-bar).

<grid-example title='Radial Bar Overrides' name='radial-bar-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts-enterprise"] }'></grid-example>

### Range Bar Overrides

These overrides are specific to the [AG Charts Range Bar Series](https://charts.ag-grid.com/react/range-bar-series/). For full list of overrides see [Range Bar Overrides](https://charts.ag-grid.com/themes-api/#reference-AgChartTheme-overrides-range-bar).

<grid-example title='Range Bar Overrides' name='range-bar-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts-enterprise"] }'></grid-example>

### Range Area Overrides

These overrides are specific to the [AG Charts Range Area Series](https://charts.ag-grid.com/react/range-area-series/). For full list of overrides see [Range Area Overrides](https://charts.ag-grid.com/themes-api/#reference-AgChartTheme-overrides-range-area).

<grid-example title='Range Area Overrides' name='range-area-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts-enterprise"] }'></grid-example>

### Box Plot Overrides

These overrides are specific to the [AG Charts Box Plot Series](https://charts.ag-grid.com/react/box-plot-series/). For full list of overrides see [Box Plot Overrides](https://charts.ag-grid.com/themes-api/#reference-AgChartTheme-overrides-box-plot).

<grid-example title='Box Plot Overrides' name='box-plot-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts-enterprise"] }'></grid-example>

### Waterfall Overrides

These overrides are specific to the [AG Charts Waterfall Series](https://charts.ag-grid.com/react/waterfall-series/). For full list of overrides see [Waterfall Overrides](https://charts.ag-grid.com/themes-api/#reference-AgChartTheme-overrides-waterfall).

<grid-example title='Waterfall Overrides' name='waterfall-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts-enterprise"] }'></grid-example>

### Heatmap Overrides

These overrides are specific to the [AG Charts Heatmap Series](https://charts.ag-grid.com/react/heatmap-series/). For full list of overrides see [Heatmap Overrides](https://charts.ag-grid.com/themes-api/#reference-AgChartTheme-overrides-heatmap).

<grid-example title='Heatmap Overrides' name='heatmap-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "rowgrouping", "charts-enterprise"] }'></grid-example>

### Treemap Overrides

These overrides are specific to the [AG Charts Treemap Series](https://charts.ag-grid.com/react/treemap-series/). For full list of overrides see [Treemap Overrides](https://charts.ag-grid.com/themes-api/#reference-AgChartTheme-overrides-treemap).

<grid-example title='Treemap Overrides' name='treemap-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "rowgrouping", "charts-enterprise"] }'></grid-example>

### Sunburst Overrides

These overrides are specific to the [AG Charts Sunburst Series](https://charts.ag-grid.com/react/sunburst-series/). For full list of overrides see [Sunburst Overrides](https://charts.ag-grid.com/themes-api/#reference-AgChartTheme-overrides-sunburst).

<grid-example title='Sunburst Overrides' name='sunburst-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "rowgrouping", "charts-enterprise"] }'></grid-example>

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

<grid-example title='Custom Chart Theme' name='custom-chart-theme' type='generated' options='{ "exampleHeight": 660,"enterprise": true,  "modules": ["clientside", "menu", "charts-enterprise"] }'></grid-example>

## Next Up

Continue to the next section to learn about: [Chart Events](/integrated-charts-events/).



