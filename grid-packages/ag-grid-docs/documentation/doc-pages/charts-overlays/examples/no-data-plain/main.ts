import { AgChart, AgChartOptions } from "ag-charts-community";

const options: AgChartOptions = {
    container: document.getElementById("myChart"),
    title: {
        text: 'A chart with missing data',
    },
    data: [],
    series: [
        {
            xKey: 'year',
            yKey: 'spending',
        },
    ],
    axes: [
        { type: 'number', position: 'left', title: { text: 'Year' } },
        { type: 'number', position: 'bottom', title: { text: 'Spending' } },
    ],
    overlays: {
        noData: {
            text: 'No data to display',
        },
    },
};

AgChart.create(options);
