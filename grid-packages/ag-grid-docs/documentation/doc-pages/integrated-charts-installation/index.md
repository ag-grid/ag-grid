---
title: "Installation"
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
import { GridChartsModule } from "@ag-grid-enterprise/charts";

ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule]);
```

<note>
If you are not using ES6 Modules and are instead using the bundled version of AG Grid Enterprise, note that `ag-grid-enterprise.js` already contains the charting module.
</note>

## Next Up

Continue to the next section to learn about the: [User Created Charts](/integrated-charts-user-created/).
