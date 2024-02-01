export { GridChartsModule } from "./gridChartsModule";
export * from './agGridCoreExtension';
import { time, AgChart, _ModuleSupport } from "ag-charts-community";

export const isEnterprise = () => _ModuleSupport.enterpriseModule.isEnterprise;
export const agCharts = {
    time,
    AgChart
}
