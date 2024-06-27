import type { ChartToolPanelName, GridApi } from 'ag-grid-community';

interface Params {
    gridApi: GridApi;
    panel?: ChartToolPanelName;
}

export function openChartToolPanel({ gridApi, panel }: Params) {
    // Get first chart
    const chartModel = gridApi.getChartModels()![0];
    const chartId = chartModel?.chartId;

    gridApi.openChartToolPanel({
        chartId,
        panel,
    });
}
