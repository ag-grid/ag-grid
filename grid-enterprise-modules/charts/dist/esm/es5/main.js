export { GridChartsModule } from "./gridChartsModule";
export * from './agGridCoreExtension';
import { time, AgChart } from "ag-charts-community";
// import { time, AgEnterpriseCharts } from "ag-charts-enterprise";
export var agCharts = {
    time: time,
    AgChart: AgChart
    // AgChart: AgEnterpriseCharts
};
