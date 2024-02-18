import { LicenseManager } from "@ag-grid-enterprise/core";
import { AgCharts } from "ag-charts-enterprise";
AgCharts.setGridContext(true);
LicenseManager.setChartsLicenseManager(AgCharts);
import "ag-charts-enterprise";
export * from "@ag-grid-enterprise/charts";
