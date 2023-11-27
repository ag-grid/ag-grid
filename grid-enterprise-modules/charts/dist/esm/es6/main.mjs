export { GridChartsModule } from "./gridChartsModule.mjs";
export * from './agGridCoreExtension.mjs';
import { time, AgChart } from "ag-charts-community";
// import { time, AgEnterpriseCharts } from "ag-charts-enterprise";
export const agCharts = {
    time,
    AgChart
    // AgChart: AgEnterpriseCharts
};
