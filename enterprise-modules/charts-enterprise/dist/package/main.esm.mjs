// enterprise-modules/charts-enterprise/src/main.ts
import { LicenseManager } from "@ag-grid-enterprise/core";
import { AgCharts } from "ag-charts-enterprise";
import "ag-charts-enterprise";
export * from "@ag-grid-enterprise/charts";
AgCharts.setGridContext(true);
LicenseManager.setChartsLicenseManager(AgCharts);
//# sourceMappingURL=main.esm.mjs.map
