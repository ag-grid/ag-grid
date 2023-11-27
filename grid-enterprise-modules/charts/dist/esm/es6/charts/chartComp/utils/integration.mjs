// import { _Scene, AgCartesianAxisType, AgChartInstance } from "ag-charts-enterprise";
export function deproxy(chartOrProxy) {
    if (chartOrProxy.chart != null) {
        return chartOrProxy.chart;
    }
    return chartOrProxy;
}
