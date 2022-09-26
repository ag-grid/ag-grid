---
title: "Chart Toolbar"
enterprise: true
---

The chart toolbar appears when the mouse hovers over the top right area of the chart, and provides access to additional functionality and the chart configuration sidebar.


<div style="display: flex; margin-bottom: 25px; margin-top: 25px; margin-left: 40px;">
    <div style="flex: 1 1 0">
        <img src="resources/chart-toolbar.png" alt="Chart Toolbar"/>
    </div>
    <div style="flex: 1 1 0;">
        From the toolbar, users can:
        <ul>
            <li>Change the chart type</li>
            <li>Change the theme</li>
            <li>Change which columns are used as categories and series</li>
            <li>Format different aspects of the chart</li>
            <li>Unlink the chart from the grid</li>
            <li>Download the chart</li>
        </ul>
    </div>
</div>

## Configuration Sidebar

Clicking on the 'hamburger' icon will open up the configuration sidebar, which provides access to a number of panels that allow the user to configure different aspects of the chart.

### Chart Settings

The chart settings panel allows users to change the chart type as well as the theme used in the chart as demonstrated below:

<gif src="chart-settings.gif" alt="Chart Settings"></gif>

Notice that charts are organised into different groups and the current chart can be changed by selecting the icon of a different chart.

The theme used by the chart can also be changed via the carousel located at the bottom of the chart setting panel.

### Chart Data

The chart data panel is used to dynamically change the data being charted as shown below:

<gif src="chart-data.gif" alt="Chart Data"></gif>

Using the chart data panel the category used in the chart can be changed via radio button selections. Multiple series can be charted and these can also be changed via checkbox selection.

Grid columns can either be configured as categories or series for charting or left for the grid to infer based on the data contained in the columns.

For more details on how the grid determines which columns are to be used as chart categories and series see the section on [Defining Categories and Series](/integrated-charts-range-chart/#defining-categories-and-series).

### Chart Format

The chart format panel allows users to change the appearance of the chart as shown below:

<gif src="chart-format.gif" alt="Chart Format"></gif>

Chart options corresponding to the currently selected chart type appear in the format panel. This gives users full control over the appearance of the chart.

## Unlinking Charts

Charts are linked to the data in the grid by default, so that if the data changes, the chart will also update. However, it is sometimes desirable to unlink a chart from the grid data. For instance, users may want to prevent a chart from being updated when subsequent sorts and filters are applied in the grid.

Unlinking a chart is achieved through the 'Unlink Chart' toolbar item as shown below:

<gif src="chart-unlinking.gif" alt="Chart Unlinking"></gif>

Notice that the chart range disappears from the grid when the chart has been unlinked, and subsequent changes to the grid sorting do not impact the chart.

## Downloading Charts

The 'Download Chart' toolbar item will download the chart as a PNG file. Note that the chart is drawn using Canvas in the browser and as such the user can also right click on the chart and save just like any other image on a web page.

## Toolbar Customisation

By default, all available toolbar items and menu panels can be accessed. However, items can be removed and reordered via the `gridOptions.getChartToolbarItems(params)` callback function.

<api-documentation source='grid-options/properties.json' section='charts' names='["getChartToolbarItems"]'  ></api-documentation>

This function receives the `GetChartToolbarItemsParams` object which contains the list of elements that are included by default in `defaultItems`, along with the grid APIs.

The list returned by the `gridOptions.getChartToolbarItems(params)` callback can be modified to reorder and omit items from the toolbar. For instance, returning an empty array will hide all toolbar items.

The example below shows how the toolbar can be customised. Notice the following:

- **Download Chart** - has been positioned as the first toolbar item.
- **Chart Data Panel** - appears first in the tabbed menu.
- **Chart Format Panel** - has been removed from the tabbed menu.
- **Unlink Toolbar Item** - has been removed from the toolbar.

<grid-example title='Toolbar Customisation' name='custom-toolbar' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "charts"] }'></grid-example>

## Chart Tool Panels Button

The Chart Tool Panels Button offers an alternative way to access the Chart Tool Panels and is enabled as shown below:

<snippet>
const gridOptions = {
    enableChartToolPanelsButton: true
}
</snippet>

When enabled, a button will appear on the left-hand-side (right-hand-side when `enableRtl=true`) of the chart. Note that the
Toolbar icons will be permanently shown, minus the 'hamburger' icon. 

The following example demonstrates the results of enabling `enableChartToolPanelsButton`:

<grid-example title='Chart Tool Panels button' name='chart-tool-panels-button' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "charts"] }'></grid-example>

## Next Up

Continue to the next section to learn about the: [Chart Container](/integrated-charts-container/).

