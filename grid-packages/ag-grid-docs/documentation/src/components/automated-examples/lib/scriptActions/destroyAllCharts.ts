import { GridApi } from 'ag-grid-community';

export function destoryAllCharts(gridApi: GridApi) {
    const chartModels = gridApi.getChartModels() || [];

    chartModels.forEach(({ chartId }) => {
        const chart = gridApi.getChartRef(chartId);
        chart?.destroyChart();
    });
}
