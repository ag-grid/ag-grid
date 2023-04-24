---
title: "Integrated Charts"
enterprise: true
---

This section introduces the grid's integrated charting functionality, which allows users to chart directly inside the grid and supports applications that want to create pre-defined charts.

The charting functionality is deeply integrated with the grid. This integration gives users a seamless charting experience while keeping the coding required by developers to a minimum.

We are not aware of any other Datagrid that provides such integration. Other companies may provide a grid library and / or a charting library, but it's up to the developer to tie the two together.

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

[[note]]
| If you are not using ES6 Modules and are instead using the bundled version of AG Grid Enterprise, note that `ag-grid-enterprise.js` already contains the charting module.

## Next Up

Continue to the next section to learn about the: [User Created Charts](/integrated-charts-user-created/).
