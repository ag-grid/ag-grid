---
title: "Integrated Charts"
enterprise: true
---

This section introduces the grid's integrated charting functionality, which allows users to chart directly inside the grid and supports applications that want to create pre-defined charts.

The charting functionality is deeply integrated with the grid. This integration gives users a seamless charting experience while keeping the coding required by developers to a minimum.

We are not aware of any other Datagrid that provides such integration. Other companies may provide a grid library and / or a charting library, but it's up to the developer to tie the two together.

## What is Integrated Charts 

Integrated Charts combines the powerful data visualisation capabilities of AG Charts with AG Grid. It provides users with a powerful toolset for data analysis all with the Datagrid.

Some of the key features of Integrated Charts include: 

- **Seamless Integration with AG Grid** - set `enableCharts=true` in GridOptions to [allow users create a chart](/integrated-charts-user-created/) using the grid's UI. Alternatively, the application can request the grid to create a chart through the grid's [charting API](/integrated-charts-application-created/).

- **Real-time Updates** - Users can interactively select data points or series within the chart by clicking and dragging, allowing for focused analysis of specific subsets of data. Filtering and sorting of Grid data are also dynamically reflected in the charts. 

- **[Extensive Chart Types](/integrated-charts-chart-types/)** - Integrated Charts supports an ever-expanding range of chart types:
    - Column / Bar
    - Pie 
    - Line 
    - Scatter
    - Area
    - Polar
    - Statistical
    - Hierarchical 
    - Specialised 
    - Combination 

- **Interactivity** - Integrated Charts has a wide range of interactivity features such as: 
    - Interactive highlight 
    - Tooltip
    - Animation
    - Navigator 
    - Zooming 

- **[Highly Customisable](/integrated-charts-customisation/)** - Integrated Charts comes with high level of customisation for developers and the end users. Theme-override can provide a template for charts created. Developers can also customise the types of charts made available to the users. An easy-to-use formatting panel provides the end users the ability to tailor their charts to different styling needs. 

- **[Exporting](/integrated-charts-api-downloading-image/)** - Users can export charts as images, making it easy to collaborate and communicate insights with others.

## Charts Module

To minimise bundle sizes for applications that do not require charting, charts are contained in a separate [AG Grid Module](/modules/),
and has been built from the ground up with zero dependencies on any third party libraries.
 
The Charts module can be imported as follows:

```ts
// Import minimal modules required for charts
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { GridChartsModule } from "@ag-grid-enterprise/charts";

ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule]);
```

<note>
If you are not using ES6 Modules and are instead using the bundled version of AG Grid Enterprise, note that `ag-grid-enterprise.js` already contains the charting module.
</note>

## Next Up

Continue to the next section to learn about: [Chart Types](/integrated-charts-chart-types/).
