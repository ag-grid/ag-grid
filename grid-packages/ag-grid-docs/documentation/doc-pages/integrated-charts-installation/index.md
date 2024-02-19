---
title: "Charts Enterprise Installation"
enterprise: true
---

## Charts Module

To minimise bundle sizes for applications that do not require charting, charts are contained in a separate [AG Grid Module](/modules/),
and has been built from the ground up with zero dependencies on any third party libraries.
 
The Charts module can be imported as follows:

```ts
// Import minimal modules required for charts
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { GridChartsModule } from "@ag-grid-enterprise/charts-enterprise";

ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule]);
```

## Charts Package

If you are not using ES6 Modules and are instead using the [bundled](/packages/) version of AG Grid Enterprise: 

```bash
npm install --save ag-grid-enterprise-charts-enterpise
```

Usage:

```ts
// import the AG Grid Enteprise package - this includes all enterprise features and performs all 
// required registration
import  "ag-grid-charts-enterprise";

// rest of your code 
```

## Next Up

Continue to the next section to learn about the: [User Created Charts](/integrated-charts-user-created/).
