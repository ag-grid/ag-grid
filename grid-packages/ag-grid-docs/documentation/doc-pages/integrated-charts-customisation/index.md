---
title: "Chart Customisation"
enterprise: true
---

Chart themes can be used to customise the look and feel of your charts to match your application.

AG Charts support [Chart Themes](/charts-themes/) to change how charts are styled. There are a number of chart themes provided out of the box by the grid. You can also provide your own custom chart theme to the grid to customise the colours of charts along with other styling options. Alternatively, you can just provide overrides to tweak the provided chart themes in the way you want.

## Provided Themes

There are five chart themes that are provided by the grid: `'ag-default'`, `'ag-material'`, `'ag-pastel'`, `'ag-vivid'` and `'ag-solar'`. When using a dark theme for the grid (e.g. `ag-theme-alpine-dark`), dark equivalents of the chart themes are provided by default instead, named with a `-dark` suffix, e.g. `'ag-vivid-dark'`.

When you create a chart, you can scroll through the different available themes in the chart settings.

<gif src="theme-picker.gif" alt="Theme Picker"></gif>

You can change which themes are available by setting the `chartThemes` property in `gridOptions`. The example below shows a different selection of themes configured in this way.

<grid-example title='Configure Available Themes' name='available-themes' type='generated' options='{ "exampleHeight": 690, "enterprise": true,  "modules": ["clientside", "menu", "charts", "rowgrouping"] }'></grid-example>

## Custom Chart Themes

You can create your own chart theme and provide it to the grid in the `customChartThemes` map on `gridOptions`. Your theme should then be specified in `chartThemes` to make it available to your users.
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

Instead of providing a whole custom chart theme, you can instead supply just a set of theme overrides. These will be applied on top of every available theme. This can be useful for tweaking the style of your charts without having to provide a whole theme, or to make changes across multiple themes.

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

### Example: Common Chart Overrides

These overrides can be used with any chart type.

<grid-example title='Common Chart Overrides' name='common-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

### Example: Cartesian Chart Overrides

These overrides can be used with any cartesian chart.

<grid-example title='Cartesian Chart Overrides' name='cartesian-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

### Example: Line Chart Overrides

<grid-example title='Line Chart Overrides' name='line-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

### Example: Bar/Column Chart Overrides

<grid-example title='Bar/Column Chart Overrides' name='bar-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

### Example: Area Chart Overrides

<grid-example title='Area Chart Overrides' name='area-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

### Example: Scatter/Bubble Chart Overrides

<grid-example title='Scatter/Bubble Chart Overrides' name='scatter-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

### Example: Pie/Doughnut Chart Overrides

<grid-example title='Pie/Doughnut Chart Overrides' name='pie-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

### Example: Histogram Chart Overrides

<grid-example title='Histogram Chart Overrides' name='histogram-overrides' type='generated' options='{ "exampleHeight": 660, "enterprise": true,  "modules": ["clientside", "menu", "charts"] }'></grid-example>

## Next Up

Continue to the next section to learn about: [Chart Events](/integrated-charts-events/).



