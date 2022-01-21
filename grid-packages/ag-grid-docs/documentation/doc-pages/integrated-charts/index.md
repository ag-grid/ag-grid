---
title: "Integrated Charts"
enterprise: true
---

This section introduces the grid's integrated charting functionality, which allows users to chart directly inside the grid and supports applications that want to create pre-defined charts.

The charting functionality is deeply integrated with the grid. This integration gives users a seamless charting experience while keeping the coding required by developers to a minimum.

We are not aware of any other datagrid that provides such integration. Other companies may provide a grid library and / or a charting library, but it's up to the developer to tie the two together.

This section introduces the two ways charts can be created from the data contained in the grid:

- [User Created Charts](#user-created-charts): A user creates a chart using the grid's UI by selecting a range of cells or entering pivot mode and then creating a chart via the context menu.
- [Application Created Charts](#application-created-charts): The application requests the grid to create a chart through the grid's charting API.

## Charts Module

To minimise bundle sizes for applications that do not require charting, charts are contained in a separate [module](/modules/), which can be imported as follows:

```ts
// Import minimal modules required for charts
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { GridChartsModule } from "@ag-grid-enterprise/charts";

ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule]);
```

The charts module has been built from the ground up with zero dependencies on any third party libraries.

[[note]]
| If you are not using ES6 Modules and are instead using the bundled version of AG Grid Enterprise, note that `ag-grid-enterprise.js` already contains the charting module.

## Enabling Charts

To enable charting in the grid set the following grid option:

<snippet>
const gridOptions = {
    enableCharts: true
}
</snippet>

To allow users to create charts from a [Range Selection](/range-selection/) and / or display the [Chart Ranges](/integrated-charts-range-chart/)
in the grid, `enableRangeSelection` should also be enabled as follows:

<snippet>
const gridOptions = {
    enableCharts: true,
    enableRangeSelection: true
}
</snippet>

## User Created Charts

User created charts are designed to provide an out-of-the box charting experience, similar to that found in spreadsheet applications such as Excel, but more compellingly it will be integrated inside your applications.

All that is required for users to create charts, from the data already contained in the grid, is to import the [charts module](#charts-module) and [enable charts](#enabling-charts).

Try it out on our [demo page](../../example.php) by doing the following:

- Select a [Cell Range](/range-selection/) of numeric values in the grid by dragging the mouse over a range of cells.
- Bring up the [Context Menu](/context-menu/) and select the desired chart type from the 'Chart Range' sub menu.

<gif src="chart-showcase.gif" alt="Chart Showcase"></gif>

The animation above highlights a number of charting features. For more details on each feature follow the links provided below:

<div style="display: flex; margin-bottom: 25px; margin-top: 25px;">
    <div style="flex: 1 1 0;">
        <ul class="content">
            <li><a href="../integrated-charts-range-chart/#creating-chart-ranges">Chart Ranges</a>: When a chart is created, corresponding chart ranges appear in the grid and can be adjusted via the chart range handle.</li>
            <li><a href="../integrated-charts-range-chart/#category-and-series-ranges">Categories and Series</a>: Columns can be configured as either categories or series for charting. If not configured then the grid will infer whether a column contains category or series data.</li>
        </ul>
    </div>
    <div style="flex: 1 1 0;">
        <img src="resources/category-range-fill-handle.png" alt="Range Handle" />
    </div>
</div>

<div style="display: flex; margin-bottom: 25px; margin-top: 25px; margin-left: 40px;">
    <div style="flex: 1 1 0;">
        <img src="resources/chart-toolbar.png" alt="Chart Toolbar" />
    </div>
    <div style="flex: 1 1 0;">
        <ul class="content">
            <li><a href="../integrated-charts-toolbar/">Chart Toolbar</a>:
                The chart toolbar is located in the top right area of the chart and allows a user to:
                <ul class="content">
                    <li>Change the chart type</li>
                    <li>Change the theme</li>
                    <li>Change which columns are used as categories and series</li>
                    <li>Format different aspects of the chart</li>
                    <li>Unlink the chart from the grid</li>
                    <li>Download the chart</li>
                </ul>
            </li>
        </ul>
    </div>
</div>

By default, user created charts are displayed inside the grid's own popup windows. The windows can be moved (by mouse dragging a window's title bar) and resized (by mouse dragging a window's borders).

It is also possible to display user created charts in an another location or application dialog. For more details see the section on [providing a chart container](/integrated-charts-container/).

[[note]]
| If using the grid's own popup window, you will probably want to use the grid option `popupParent` so that the popup windows are not constrained to the bounds of the grid. Typically users set `popupParent=document.body` to achieve this.

## Application-created Charts

Charts can be pre-defined or dynamically created from within applications, and as with [user-created charts](#user-created-charts), these charts also benefit from the integration provided with the grid.

The dummy financial application below just touches on what is possible with the grid's integrated charting capabilities. The following should be noted:

- **Pre-Defined Chart**: A pre-defined chart is shown in a separate chart container below the grid.
- **Dynamic Charts**: Buttons positioned above the grid dynamically create different chart types.
- **High Performance**: 100 rows are randomly updated 10 times a second (1,000 updates per second). Try updating the example via Plunker with higher update frequencies and more data.

<grid-example title='Application Created Charts' name='application-created-charts' type='typescript' options='{ "exampleHeight": 825, "enterprise": true, "modules": ["clientside", "charts"] }'></grid-example>

To learn how to create charts in your applications see the following sections for details:

- [Chart API](/integrated-charts-api/): Used to create charts programmatically inside applications.
- [Provide a Chart Container](/integrated-charts-container/): Used to target chart containers inside the application instead of the popup window provided by the grid.

## Chart Customisation

Before each chart is created, the developer can perform fine-grained [Chart Customisation](/integrated-charts-customisation/) to change the chart's appearance and behaviour. For example, you can change the thickness of the lines, or customise the formatting of the axis labels.

The section [Chart Customisation](/integrated-charts-customisation/) outlines all the items that can be customised for each chart type.

## Next Up

Continue to the next section to learn about the: [Range Chart](/integrated-charts-range-chart/).
