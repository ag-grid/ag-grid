---
title: "Integrated Charts"
enterprise: true
---

This section introduces the grid's integrated charting functionality, which allows users to chart directly inside the grid and supports applications that want to create pre-defined charts.

The charting functionality is deeply integrated with the grid. This integration gives users a seamless charting experience while keeping the coding required by developers to a minimum.

We are not aware of any other Datagrid that provides such integration. Other companies may provide a grid library and / or a charting library, but it's up to the developer to tie the two together.

## What is Integrated Charts 

Integrated Chart combines the powerful data visualisation capabilities of AG Charts with the highly customisable, feature-rich AG Grid. It provides users with a powerful toolset for data analysis.

Some of the key features of Integrated Charts include: 

1. **Extensive Chart Types** - Integrated Charts supports a variety of chart types, from the common bar / column charts to more specialised charts such as hierachical charts and heatmap. This allows the users to choose the most suitable visualisations based on the data analysis needs from our ever expanding chart library. 

2. **Interactivity** - Integrated Charts has a wide range of interactivity features that enhance the use experience and enables a deeper exploration of data. Features like interactive highlight and tooltip, animation, navigator and zooming empower users to dynamically manipulate and analyse the charts, with minimised configuration and development required. 

3. **Real-time Updates** - Users can interactively select data points or series within the chart by click and dragging, allowing for focused analysis of specific subsets of data. Filters and sorting of Grid data are also dynamically reflected in the charts. 

4. **Customisation** - Integrated Charts comes with high level of customisaton for developers and the end users. Theme-override can provide a template for charts created. Developers can also customise the types of charts made available to the users. An easy-to-use formatting panel provides the end users the ability to tailor their charts to different styling needs. 

5. **Exporting** -  Users can export charts as images, making it easy to collaborate and communicate insights with others.

## Creating an Integrated Chart

The following sections cover the alternative ways grid data can be charted using Integrated Charts:

- [User Created Charts](/integrated-charts-user-created/): A user creates a chart using the grid's UI by selecting a range of cells or entering pivot mode and then creating a chart via the context menu.
- [Application Created Charts](/integrated-charts-application-created/): The application requests the grid to create a chart through the grid's charting API.

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
