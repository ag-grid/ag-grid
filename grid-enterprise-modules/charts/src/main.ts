export { GridChartsModule } from "./gridChartsModule";
export * from './agGridCoreExtension';
import { time, AgEnterpriseCharts } from "ag-charts-enterprise";

export const agCharts = {
    time,
    AgChart: AgEnterpriseCharts
}
