---
title: "Chart Toolbar"
enterprise: true
---

The chart toolbar allows users to unlink charts from the grid and download the current chart.   

<figure>
    <img src="resources/chart-toolbar.png" alt="Chart Toolbar" />
    <figcaption style="text-align: center; font-size: 0.85rem; margin-top: 10px;">Chart Toolbar</figcaption>
</figure>

[[note]]
| To use the legacy 'hamburger' Chart Toolbar, enable the `suppressChartToolPanelsButton` grid option.

## Unlinking Charts

Charts are linked to the data in the grid by default, so that if the data changes, the chart will also update. However, it is sometimes desirable to unlink a chart from the grid data. For instance, users may want to prevent a chart from being updated when subsequent sorts and filters are applied in the grid.

Unlinking a chart is achieved through the 'Unlink Chart' toolbar item highlighted below:

<div style="display: flex; margin-bottom: 25px; margin-top: 25px; margin-left: 40px; gap: 40px">
    <figure style="flex: 1; margin: 0;">
        <img src="resources/chart-toolbar-link-chart.png" alt="Chart Toolbar Link button with linked data"/>
        <figcaption style="text-align: center; font-size: 0.85rem; margin-top: 10px;">Chart Toolbar Link button with linked data</figcaption>
    </figure>
    <figure style="flex: 1; margin: 0;">
        <img src="resources/chart-toolbar-unlink-chart.png" alt="Chart Toolbar Link button with unlinked data"/>
        <figcaption style="text-align: center; font-size: 0.85rem; margin-top: 10px;">Chart Toolbar Link button with unlinked data</figcaption>
    </figure>
</div>

Notice that the chart range disappears from the grid when the chart has been unlinked. Subsequent changes to the grid sorting also do not impact the chart.

## Downloading Charts

The 'Download Chart' toolbar item will download the chart as a `PNG` file. Note that the chart is drawn using Canvas in the browser and as such the user can also right click on the chart and save just like any other image on a web page.

<figure>
    <img src="resources/chart-toolbar-download.png" alt="Chart Toolbar Download Chart button"/>
    <figcaption style="text-align: center; font-size: 0.85rem; margin-top: 10px;">Chart Toolbar Download Chart button</figcaption>
</figure>

The chart can also be [downloaded using the Grid API](/integrated-charts-api-downloading-image).

## Toolbar Customisation

The chart tool bar can be customised using the `gridOptions.getChartToolbarItems(params)` callback function.

<api-documentation source='grid-options/properties.json' section='charts' names='["getChartToolbarItems"]'  ></api-documentation>

This function receives the `GetChartToolbarItemsParams` object which contains the list of elements that are included by default in `defaultItems`, along with the grid APIs.

The list returned by the `gridOptions.getChartToolbarItems(params)` callback can be modified to reorder and omit items from the toolbar. For instance, returning an empty array will hide all toolbar items.

The example below shows how the toolbar can be customised to only show the 'Download Chart' toolbar item.

<grid-example title='Toolbar Customisation' name='custom-toolbar' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "charts"] }'></grid-example>

[[note]]
| If the legacy 'hamburger' Chart Toolbar is used with the `suppressChartToolPanelsButton` grid option, then `gridOptions.getChartToolbarItems(params)` will also determine the Chart Tool Panels shown. Otherwise, the [Chart Tool Panels configuration](/integrated-charts-chart-tool-panels/#omitting--ordering-tool-panels) determines which Chart Tool Panels are shown.

## Next Up

Continue to the next section to learn about the: [Chart Container](/integrated-charts-container/).